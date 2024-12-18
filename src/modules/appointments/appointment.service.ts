import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { Appointment, Status } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: DatabaseService) {}

  // Criar agendamento de serviço
  async createAppointment(data: {
    date: Date;
    clientId?: number;
    guestClientId?: number;
    employeeId: number;
    serviceId: number;
  }) {
    // Verifica a disponibilidade do funcionário e do serviço no horário desejado
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        employeeId: data.employeeId,
        date: data.date,
        status: Status.PENDING, // Garantir que o funcionário não tenha outro agendamento
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('Funcionário já tem outro agendamento nesse horário.');
    }

    return await this.prisma.appointment.create({
      data: {
        date: data.date,
        clientId: data.clientId,
        guestClientId: data.guestClientId,
        employeeId: data.employeeId,
        serviceId: data.serviceId,
        status: Status.PENDING, // Status inicial como PENDENTE
      },
    });
  }

  async updateAppointmentStatus(id: number, status: Status) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado.');
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  async listAppointments() {
    return this.prisma.appointment.findMany({
      where: { status: Status.PENDING }, // Filtra por agendamentos pendentes
    });
  }
}

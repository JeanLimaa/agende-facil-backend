import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { Appointment, Status } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { isAfter, isBefore, parseISO, set } from 'date-fns';
import { is } from 'date-fns/locale';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: DatabaseService) {}

  // Criar agendamento de serviço
  async createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
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

    // verifica se o agendamento está no horario de atendimento do funcionario
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    
    if(!employee) throw new BadRequestException('Funcionário não encontrado.');

    // Criar os horários de início e fim como objetos Date
    const appointmentDate = parseISO(data.date);
    const startHour = set(appointmentDate, {
      hours: parseInt(employee.startHour.split(':')[0], 10),
      minutes: parseInt(employee.startHour.split(':')[1], 10),
      seconds: 0,
    });

    const endHour = set(appointmentDate, {
      hours: parseInt(employee.endHour.split(':')[0], 10),
      minutes: parseInt(employee.endHour.split(':')[1], 10),
      seconds: 0,
    });

    if(isBefore(appointmentDate, startHour) || isAfter(appointmentDate, endHour)) {
      throw new BadRequestException('Funcionário não atende nesse horário.');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        date: data.date,
        clientId: data.clientId,
        guestClientId: data.guestClientId,
        employeeId: data.employeeId,
        //serviceId: data.serviceId,
        status: Status.PENDING, // Status inicial como PENDENTE
      },
    });

    const appointmentServices = await this.prisma.appointmentService.createMany({
      data: data.serviceId.map((serviceId) => ({
        appointmentId: appointment.id,
        serviceId,
      })),
    });

    if(!appointmentServices) {
      throw new BadRequestException('Erro ao criar agendamento.');
    };

    return appointment;
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

  async findAppointmentById(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
    });
  }

  async deleteAppointment(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}

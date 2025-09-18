import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { Appointment, Role, Status } from '@prisma/client';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { BlockAppointmentDto } from './dto/block-appointment.dto';
import { isAfter, isBefore, parseISO, set, differenceInMinutes } from 'date-fns';
import { sumByProp } from 'src/common/helpers/sumTotal.helper';
import { EmployeeService } from '../employee/employee.service';

const statusTranslation = {
  [Status.PENDING]: 'Pendente',
  [Status.CONFIRMED]: 'Confirmado',
  [Status.CANCELLED]: 'Cancelado',
  [Status.COMPLETED]: 'Concluído',
};

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly employeeService: EmployeeService
  ) {}

  public async createAppointment(data: CreateAppointmentDto, role: Role): Promise<Appointment> {
    return await this.prisma.$transaction(async (prismaTransaction) => {
      const appointmentData = await this.prepareAppointmentData(data, role);
  
      const appointment = await prismaTransaction.appointment.create({
        data: appointmentData,
      });
  
      // cria os relacionamentos com os serviços
      await prismaTransaction.appointmentService.createMany({
        data: data.serviceId.map((serviceId) => ({
          appointmentId: appointment.id,
          serviceId,
        })),
      });
  
      return appointment;
    });
  }

  public async createBlock(dto: BlockAppointmentDto): Promise<Appointment> {
    // Verifica conflito de horário para o funcionário em todo o intervalo
    //await this.checkForBlockConflicts(dto.startDate, dto.endDate, dto.employeeId);

    const start = parseISO(dto.startDate);
    const end = parseISO(dto.endDate);
    const duration = differenceInMinutes(end, start);
    
    return this.prisma.appointment.create({
      data: {
        date: start,
        employeeId: dto.employeeId,
        clientId: 1, // Cliente fixo para bloqueio
        isBlock: true,
        status: 'PENDING',
        subTotalPrice: 0,
        discount: 0,
        totalPrice: 0,
        totalDuration: duration,
      },
    });
  }

/*   private async checkForBlockConflicts(startDate: string, endDate: string, employeeId: number) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflicting = await this.prisma.appointment.findFirst({
      where: {
        employeeId,
        // Conflito se houver qualquer agendamento/bloqueio que inicie ou termine dentro do intervalo
        OR: [
          {
            date: {
              gte: start,
              lt: end,
            },
          },
          {
            AND: [
              {
                date: {
                  lte: start,
                },
              },
              {
                // appointment termina depois do início do bloqueio
                totalDuration: {
                  gt: 0,
                },
              },
            ],
          },
        ],
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    if (conflicting) {
      throw new BadRequestException('Já existe um agendamento ou bloqueio para este intervalo.');
    }
  } */

  public async updateAppointmentStatus(id: number, status: Status) {
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

  public async listPendingAppointments() {
    return this.prisma.appointment.findMany({
      where: { status: Status.PENDING, isBlock: false }, // Filtra por agendamentos pendentes
    });
  }

  public async findAllByCompany(companyId: number) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        employee: {
          companyId,
        },
        isBlock: false,
      },
      include: {
        client: true
      }
    });

    return appointments.map((appointment) => ({
      ...appointment,
      status: statusTranslation[appointment.status],
      clientName: appointment.client.name
    }));
  }

  public async findAppointmentById(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id, isBlock: false },
      include: {
        client: true,
        employee: true,
        appointmentServices: true
      },
    });
  }

  public async deleteAppointment(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  public async markAsCompleted(id: number, companyId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado.');
    }

    // Verifica se a solicitação é feita por alguém da empresa
    const employee = await this.prisma.employee.findUnique({
      where: { id: appointment.employeeId },
    });
    if (!employee || employee.companyId !== companyId) {
      throw new UnauthorizedException('Acesso não autorizado. Você não pode marcar este agendamento como atendido, pois não pertence à empresa.');
    }

    if (appointment.status !== Status.PENDING) {
      throw new BadRequestException('Agendamento não pode ser marcado como atendido, pois não está pendente.');
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: { status: Status.COMPLETED },
    });
  }

  public async markAsCanceled(id: number, companyId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado.');
    }

    // Verifica se a solicitação é feita por alguém da empresa
    const employee = await this.prisma.employee.findUnique({
      where: { id: appointment.employeeId },
    });
    if (!employee || employee.companyId !== companyId) {
      throw new UnauthorizedException('Acesso não autorizado. Você não pode marcar este agendamento como atendido, pois não pertence à empresa.');
    }

    if (appointment.status !== Status.PENDING) {
      throw new BadRequestException('Agendamento não pode ser cancelado, pois não está pendente.');
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: { status: Status.CANCELLED },
    });
  }

  public async updateAppointment(id: number, data: CreateAppointmentDto, role: Role) {
    return await this.prisma.$transaction(async (prismaTransaction) => {
      const appointment = await prismaTransaction.appointment.findUnique({
        where: { id },
      });
  
      if (!appointment) {
        throw new BadRequestException('Agendamento não encontrado.');
      }
  
      const appointmentData = await this.prepareAppointmentData(data, role);
  
      const updated = await prismaTransaction.appointment.update({
        where: { id },
        data: {
          date: appointmentData.date,
          totalDuration: appointmentData.totalDuration,
          subTotalPrice: appointmentData.subTotalPrice,
          discount: appointmentData.discount,
          totalPrice: appointmentData.totalPrice,
          status: appointmentData.status,
        },
      });
  
      // Atualiza os serviços associados
      await prismaTransaction.appointmentService.deleteMany({ where: { appointmentId: id } });
  
      await prismaTransaction.appointmentService.createMany({
        data: data.serviceId.map((serviceId) => ({
          appointmentId: id,
          serviceId,
        })),
      });
  
      return updated;
    });
  }

  private async prepareAppointmentData(data: CreateAppointmentDto, role: Role) {
    try {
      
      const employee = await this.prisma.employee.findUnique({
        where: { id: data.employeeId },
      });
  
      if (!employee) {
        throw new BadRequestException('Funcionário não encontrado.');
      }
  
      if (employee.startHour && employee.endHour) {
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
  
        if (isBefore(appointmentDate, startHour) || isAfter(appointmentDate, endHour)) {
          throw new BadRequestException('Funcionário não atende nesse horário.');
        }
      }
  
      const isAvailable = await this.employeeService.isTimeAvailable(
        data.employeeId,
        parseISO(data.date),
        employee.serviceInterval,
        true
      ); 
  
      if (!isAvailable) {
        throw new BadRequestException('Funcionário não está disponível nesse horário.');
      }
  
      const services = await this.prisma.service.findMany({
        where: {
          id: { in: data.serviceId },
        },
      });
      console.log('Services found:', services);
      const subTotalPrice = sumByProp(services, 'price');
      console.log('SubTotalPrice calculated:', subTotalPrice);
      const discount = (role === Role.ADMIN || role === Role.EMPLOYEE) ? data.discount : 0;
  
      if (discount > subTotalPrice) {
        throw new BadRequestException('Desconto não pode ser maior que o valor total.');
      }
  
      if (discount < 0) {
        throw new BadRequestException('Desconto não pode ser negativo.');
      }
      
      return {
        date: data.date,
        clientId: data.clientId,
        employeeId: data.employeeId,
        totalDuration: sumByProp(services, 'duration'),
        subTotalPrice,
        discount,
        totalPrice: subTotalPrice - discount,
        status: Status.PENDING,
      };
    } catch (error) {
      if(error instanceof HttpException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Erro ao preparar dados do agendamento.');
    }
  }

  public async findAllByClient(clientId: number, companyId: number) {
    const client = this.prisma.client.findUnique({
      where: { id: clientId, companyId },
    });

    if (!client) {
      throw new BadRequestException('Cliente não encontrado ou não pertence à empresa.');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        employee: true,
        appointmentServices: {
          include: {
            service: true,
          },
        },
      },
    });

    // Extrai apenas os services e remove duplicatas
    const formatted = appointments.map((appointment) => {
      const { appointmentServices, ...rest } = appointment;

      return {
        ...rest,
        services: appointmentServices.map((as) => as.service),
      };
    });

    return formatted;
  }
}

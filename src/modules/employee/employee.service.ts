import { BadRequestException, Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class EmployeeService {
    constructor(
        private readonly prisma: DatabaseService
    ) { }

    public async getEmployeeById(employeeId: number) {
        return await this.prisma.employee.findUnique({
            where: { id: employeeId }
        });
    }

    public async listByCompanyId(companyId: number) {
        return await this.prisma.employee.findMany({
            where: { companyId }
        });
    }

    // Verificar disponibilidade do funcionário para determinado serviço e data
    async getAvailableTimes(employeeId: number, serviceId: number, date: Date) {
        const service = await this.prisma.service.findFirst({
            where: { id: serviceId },
        });

        if (!service) {
            throw new BadRequestException('Serviço não encontrado');
        }

        const serviceDuration = service.duration; // Duração do serviço em minutos

        // Buscar agendamentos do funcionário no dia escolhido
        const appointments = await this.prisma.appointment.findMany({
            where: {
                employeeId,
                date: {
                    gte: new Date(date.setHours(0, 0, 0, 0)), // A partir da meia-noite do dia
                    lt: new Date(date.setHours(23, 59, 59, 999)), // Até a última hora do dia
                },
                status: Status.PENDING, // Agendamentos pendentes
            },
        });

        // Listar os horários disponíveis para o funcionário no dia
        const availableTimes: string[] = [];
        let startTime = new Date(date);

        // verificar cada intervalo de tempo (em minutos) durante o dia
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += serviceDuration) {
                const proposedStartTime = new Date(startTime.setHours(hour, minute));

                // Verificar se o horário já está ocupado
                const isAvailable = !appointments.some((appointment) => {
                    const appointmentStart = new Date(appointment.date);
                    const appointmentEnd = new Date(appointmentStart.getTime() + service.duration * 60000); // Duração em milissegundos
                    return proposedStartTime >= appointmentStart && proposedStartTime <= appointmentEnd;
                });

                if (isAvailable) {
                    availableTimes.push(proposedStartTime.toLocaleTimeString());
                }
            }
        }

        return availableTimes;
    }
}

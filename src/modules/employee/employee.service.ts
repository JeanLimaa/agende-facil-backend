import { BadRequestException, Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

import { format, isBefore, isAfter, addMinutes, startOfDay, endOfDay, parseISO, isEqual } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    async getAvailableTimes(employeeId: number, date: string) {
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) throw new BadRequestException('Funcionário não encontrado');

        
        const parsedDate = parseISO(date + " 00:00:00");
        if (isNaN(parsedDate.getTime())) throw new BadRequestException('Data inválida. Esperado formato: "yyyy-MM-dd"');
     
        const today = startOfDay(new Date());
        if(isBefore(parsedDate, today)) throw new BadRequestException('A data não pode ser anterior a hoje.');

        const employeeStartHour = this.parseTimeToMinutes(employee.startHour);  // Ex: Converte "09:00" (HH:mm) para minutos
        const employeeEndHour = this.parseTimeToMinutes(employee.endHour);
        const interval = employee.serviceInterval;

        const dayStart = startOfDay(parsedDate);
        const dayEnd = endOfDay(parsedDate);

        const appointments = await this.prisma.appointment.findMany({
            where: {
                employeeId,
                date: {
                    gte: dayStart,
                    lte: dayEnd,
                },
                status: Status.PENDING,
            },
            include: { service: true },
        });

        const availableTimes: string[] = [];
        
        for (let minutes = employeeStartHour; minutes <= employeeEndHour; minutes += interval) {
            const proposedTime = addMinutes(dayStart, minutes);
            
            const isAvailable = !appointments.some(appointment => {
                const appointmentStart = new Date(appointment.date);
                const appointmentDuration = appointment.service?.duration || interval;
                const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

                const isIntersecting = isBefore(proposedTime, appointmentEnd) && isAfter(proposedTime, appointmentStart);
                return isEqual(proposedTime, appointmentStart) || isIntersecting;
            });
            
            if (isAvailable) {
                const time = format(proposedTime, 'HH:mm', { locale: ptBR });
                availableTimes.push(time);
            }
        }

        return availableTimes;
    }
    
    private parseTimeToMinutes(time: string | null): number {
        if (!time) throw new Error('Horário inválido');
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
}

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

import { format, isBefore, isAfter, addMinutes, startOfDay, endOfDay, parseISO, isEqual } from 'date-fns';
import { is, ptBR } from 'date-fns/locale';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';

@Injectable()
export class EmployeeService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly userService: UserService,
        private readonly companyService: CompanyService
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
    public async getAvailableTimes(employeeId: number, date: string) {
        const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) throw new BadRequestException('Funcionário não encontrado');
        
        const parsedDate = parseISO(date + " 00:00:00");
        if (isNaN(parsedDate.getTime())) throw new BadRequestException('Data inválida. Esperado formato: "yyyy-MM-dd"');
     
        const today = startOfDay(new Date());
        if(isBefore(parsedDate, today)) throw new BadRequestException('A data não pode ser anterior a hoje.');

        const employeeStartHour = employee.startHour ? this.parseTimeToMinutes(employee.startHour) : 0;  // Ex: Converte "09:00" (HH:mm) para minutos
        const employeeEndHour = employee.endHour ? this.parseTimeToMinutes(employee.endHour) : 1 * 60 * 23 ;
        const interval = employee.serviceInterval;

        const dayStart = startOfDay(parsedDate);
            
        const availableTimes: string[] = [];
        
        for (let minutes = employeeStartHour; minutes <= employeeEndHour; minutes += interval) {
            const proposedTime = addMinutes(dayStart, minutes);
            
            const isAvailable = await this.isTimeAvailable(employeeId, proposedTime, interval);
            
            if (isAvailable) {
                const time = format(proposedTime, 'HH:mm', { locale: ptBR });
                availableTimes.push(time);
            }
        }

        return availableTimes;
    }

    public async isTimeAvailable(
        employeeId: number,
        proposedTime: Date,
        interval: number,
        checkOnlyBlocks: boolean = false
    ): Promise<boolean> {
        const dayStart = startOfDay(proposedTime);
        const dayEnd = endOfDay(proposedTime);

        const appointments = await this.prisma.appointment.findMany({
            where: {
                employeeId,
/*                 date: {
                    gte: dayStart,
                    lte: dayEnd,
                }, */
                status: Status.PENDING,
                ...(checkOnlyBlocks ? { isBlock: true } : {}),
            },
            include: { appointmentServices: true },
        });

        return !appointments.some(appointment => {
            const appointmentStart = new Date(appointment.date);

/*             const appointmentDuration = appointment.appointmentServices.reduce((acc, as) => {
                const service = services.find(s => s.id === as.serviceId);
                return acc + (service?.duration || interval);
            }, 0); */
            const appointmentDuration = appointment.totalDuration || interval;

            const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

            const isIntersecting = isBefore(proposedTime, appointmentEnd) && isAfter(proposedTime, appointmentStart);
            
            return isEqual(proposedTime, appointmentStart) || isIntersecting;
        });
    }

    private parseTimeToMinutes(time: string | null): number {
        if (!time) throw new BadRequestException('Horário inválido');
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    public async createEmployee(data: Prisma.EmployeeCreateManyInput){
        return await this.prisma.employee.create({
            data
        });
    }

    public async registerEmployee(adminId: number, user: CreateEmployeeDto) {
        const isAdminRequest = await this.userService.isUserAdmin(adminId);

        if (!isAdminRequest) {
            throw new UnauthorizedException('Apenas administradores podem cadastrar funcionários');
        }

        const companyId = await this.companyService.findCompanyIdByUserId(adminId);
        const employee = await this.createEmployee({
            companyId,
            name: user.name,
            phone: user.phone,

        });

        return employee;
    }
}
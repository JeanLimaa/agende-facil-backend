import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Employee, EmployeeWorkingHour, Prisma, Status } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

import { format, isBefore, isAfter, addMinutes, startOfDay, endOfDay, parseISO, isEqual, isSameDay } from 'date-fns';
import { is, ptBR } from 'date-fns/locale';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { parseTimeToMinutes, validateDayOfWeek, validateTimeRange, isTimeWithinRange, isValidTimeFormat } from 'src/common/helpers/time.helper';
import { TransactionService } from '../../common/services/transaction-context.service';
import { DailyWorkingHoursDto } from '../settings/dto/company-working-hours.dto';
import { ServiceService } from '../service/service.service';
import { GetAvailableTimesDTO } from './dto/get-available-times.dto';

@Injectable()
export class EmployeeService {
    private readonly logger = new Logger(EmployeeService.name);

    constructor(
        private readonly prisma: DatabaseService,
        private readonly userService: UserService,
        private readonly companyService: CompanyService,
        private readonly transactionService: TransactionService,
        private readonly servicesService: ServiceService
    ) { }

    public async getOrThrowEmployeeById(employeeId: number) {
        try {
            this.logger.log('Getting employee by ID', { employeeId });

            const employee = await this.prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    workingHours: true,
                    employeeServices: { select: { service: true } }
                }
            });

            if (!employee) {
                this.logger.warn('Employee not found', { employeeId });
                throw new BadRequestException('Funcionário não encontrado');
            }

            this.logger.log('Employee found successfully', {
                employeeId,
                employeeName: employee.name,
                companyId: employee.companyId
            });

            return employee;
        } catch (error) {
            this.logger.error('Error getting employee by ID', error.stack, { employeeId });
            throw error;
        }
    }

    public async listByCompanyId(companyId: number) {
        try {
            this.logger.log('Listing employees by company ID', { companyId });

            const employees = await this.prisma.employee.findMany({
                where: { companyId, isActive: true },
                orderBy: { name: 'asc' },
                include: {
                    workingHours: true,
                    employeeServices: { select: { service: true } }
                }
            });

            this.logger.log('Employees listed successfully', {
                companyId,
                employeeCount: employees.length
            });

            return employees;
        } catch (error) {
            this.logger.error('Error listing employees by company ID', error.stack, { companyId });
            throw error;
        }
    }

    // Verificar disponibilidade do funcionário para determinado serviço e data
    public async getAvailableTimes(employeeId: number, date: string, dto: GetAvailableTimesDTO) {
        const services = await this.servicesService.getByIdsWithCategory(dto.servicesId);
        const categoriesId = services.map(s => s.categoryId);

        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                workingHours: true,
                ...(categoriesId && {
                    employeeCategoryWorkingHours: {
                        where: { categoryId: { in: categoriesId } },
                        orderBy: { dayOfWeek: 'asc' }
                    }
                })
            }
        });

        if (!employee) throw new BadRequestException('Funcionário não encontrado');

        const parsedDate = parseISO(date + " 00:00:00");
        if (isNaN(parsedDate.getTime())) throw new BadRequestException('Data inválida. Esperado formato: "yyyy-MM-dd"');

        const today = startOfDay(new Date());
        if (isBefore(parsedDate, today)) throw new BadRequestException('A data não pode ser anterior a hoje.');

        const dayOfWeek = parsedDate.getDay();

        // Verificar se existem horários específicos para a categoria
        const workingHoursForDay = await this.getWorkingHoursForDay(
            employee.employeeCategoryWorkingHours,
            employee.workingHours,
            employee.companyId,
            dayOfWeek,
            categoriesId
        );

        if (!workingHoursForDay) {
            return []; // Não trabalha neste dia se não encontrar horários
        }

        const employeeStartHour = parseTimeToMinutes(workingHoursForDay.startTime);
        const employeeEndHour = parseTimeToMinutes(workingHoursForDay.endTime);
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
        const beforeDayStart = startOfDay(addMinutes(proposedTime, -1440)); // dia anterior
        const afterDayEnd = endOfDay(addMinutes(proposedTime, 1440)); // dia seguinte

        const today = startOfDay(new Date());
        const now = new Date();
        const appoinmentIsForToday = isSameDay(proposedTime, today);

        if (appoinmentIsForToday && isBefore(proposedTime, now)) {
            return false;
        }

        const appointments = await this.prisma.appointment.findMany({
            where: {
                employeeId,
                date: {
                    gte: beforeDayStart,
                    lte: afterDayEnd,
                },
                status: Status.PENDING,
                ...(checkOnlyBlocks ? { isBlock: true } : {}),
            },
            include: { appointmentServices: true },
        });

        return !appointments.some(appointment => {
            const appointmentStart = new Date(appointment.date);

            const appointmentDuration = appointment.totalDuration || interval;

            const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

            const isIntersecting = isBefore(proposedTime, appointmentEnd) && isAfter(proposedTime, appointmentStart);

            return isEqual(proposedTime, appointmentStart) || isIntersecting;
        });
    }

    public async createEmployee(data: Prisma.EmployeeCreateManyInput) {
        try {
            this.logger.log('Creating new employee', {
                name: data.name,
                companyId: data.companyId
            });

            const employee = await this.prisma.employee.create({
                data
            });

            this.logger.log('Employee created successfully', {
                employeeId: employee.id,
                name: employee.name,
                companyId: employee.companyId
            });

            return employee;
        } catch (error) {
            this.logger.error('Error creating employee', error.stack, {
                name: data.name,
                companyId: data.companyId
            });
            throw error;
        }
    }

    public async validateHierarchicalConstraints(
        companyId: number,
        workingHours: DailyWorkingHoursDto[]
    ): Promise<void> {
        this.logger.log('Validating hierarchical constraints for employee working hours', {
            companyId,
            workingHoursCount: workingHours.length
        });

        // Buscar horários da empresa
        const companyWorkingHours = await this.companyService.getCompanyWorkingHours(companyId);

        for (const employeeHour of workingHours) {
            // Validar formato dos horários
            if (!isValidTimeFormat(employeeHour.startTime)) {
                throw new BadRequestException(`Horário de início inválido: ${employeeHour.startTime}. Use o formato HH:mm`);
            }

            if (!isValidTimeFormat(employeeHour.endTime)) {
                throw new BadRequestException(`Horário de término inválido: ${employeeHour.endTime}. Use o formato HH:mm`);
            }

            // Validar range básico
            validateTimeRange(employeeHour.startTime, employeeHour.endTime);

            // Buscar horário da empresa para o mesmo dia
            const companyHourForDay = companyWorkingHours.find(
                ch => ch.dayOfWeek === employeeHour.dayOfWeek
            );

            if (!companyHourForDay) {
                const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                throw new BadRequestException(
                    `A empresa não funciona no dia ${dayNames[employeeHour.dayOfWeek]}. ` +
                    `O funcionário não pode ter horários configurados para este dia.`
                );
            }

            // Validar se o horário do funcionário está dentro do horário da empresa
            const employeeStart = employeeHour.startTime;
            const employeeEnd = employeeHour.endTime;
            const companyStart = companyHourForDay.startTime;
            const companyEnd = companyHourForDay.endTime;

            if (!isTimeWithinRange(employeeStart, companyStart, companyEnd)) {
                const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                throw new BadRequestException(
                    `Horário de início do funcionário (${employeeStart}) está fora do horário de funcionamento da empresa. ` +
                    `${dayNames[employeeHour.dayOfWeek]}: ${companyStart} às ${companyEnd}`
                );
            }

            if (!isTimeWithinRange(employeeEnd, companyStart, companyEnd)) {
                const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                throw new BadRequestException(
                    `Horário de término do funcionário (${employeeEnd}) está fora do horário de funcionamento da empresa. ` +
                    `${dayNames[employeeHour.dayOfWeek]}: ${companyStart} às ${companyEnd}`
                );
            }
        }

        this.logger.log('Hierarchical constraints validation passed', {
            companyId,
            workingHoursCount: workingHours.length
        });
    }

    public async registerEmployee(adminId: number, dto: CreateEmployeeDto) {
        try {
            const prisma = this.transactionService.getPrismaInstance();

            this.logger.log('Starting employee registration', {
                adminId,
                employeeName: dto.profile.name
            });

            const companyId = await this.companyService.findCompanyIdByUserId(adminId);

            this.logger.log('Creating employee profile with transaction', {
                adminId,
                companyId,
                employeeName: dto.profile.name
            });

            const employee = await this.transactionService.runInTransaction(async () => {
                // Validar se funcionário pode ser registrado
                await this.validateEmployeeRegistration(prisma, adminId, dto.profile.name, companyId);

                // Criar funcionário
                const newEmployee = await prisma.employee.create({
                    data: {
                        companyId,
                        name: dto.profile.name,
                        phone: dto.profile.phone,
                        displayOnline: dto.profile.displayOnline,
                        position: dto.profile.position,
                        profileImageUrl: dto.profile.profileImageUrl || null,
                    }
                });

                // Criar horários de trabalho se fornecidos
                await this.createEmployeeWorkingHours(
                    prisma,
                    newEmployee.id,
                    companyId,
                    dto.workingHours
                );

                return newEmployee;
            });

            this.logger.log('Employee registration completed successfully', {
                employeeId: employee.id,
                adminId,
                companyId
            });

            return employee;
        } catch (error) {
            this.logger.error('Employee registration failed', error.stack, {
                adminId,
                employeeName: dto.profile.name
            });
            throw error;
        }
    }

    public async updateEmployee(userId: number, employeeId: number, dto: CreateEmployeeDto) {
        try {
            this.logger.log('Starting employee update', { userId, employeeId });

            const prisma = this.transactionService.getPrismaInstance();

            // Validar autorização e existência do funcionário
            await this.validateEmployeeUpdate(userId, employeeId);

            const updatedEmployee = await this.transactionService.runInTransaction(async () => {
                // Atualizar dados básicos do funcionário
                const employee = await this.updateEmployeeBasicData(
                    prisma,
                    employeeId,
                    dto.profile,
                    dto.workingHours.serviceInterval
                );

                // Atualizar horários de trabalho
                await this.updateEmployeeWorkingHours(
                    prisma,
                    employeeId,
                    employee.companyId,
                    dto.workingHours.workingHours
                );

                // Atualizar serviços do funcionário
                await this.updateEmployeeServices(
                    prisma,
                    employeeId,
                    dto.employeeServices
                );

                return employee;
            });

            this.logger.log('Employee updated successfully', {
                employeeId,
                userId,
                employeeName: updatedEmployee.name
            });

            return updatedEmployee;
        } catch (error) {
            this.logger.error('Error updating employee', error.stack, { userId, employeeId });
            throw error;
        }
    }

    public async deleteEmployee(userId: number, employeeId: number) {
        try {
            this.logger.log('Starting employee deletion', { userId, employeeId });

            await this.getOrThrowEmployeeById(employeeId);

            const isAdminRequest = await this.userService.isUserAdmin(userId);
            if (!isAdminRequest && userId !== employeeId) {
                this.logger.warn('Unauthorized employee deletion attempt', { userId, employeeId });
                throw new UnauthorizedException('Apenas administradores podem excluir funcionários');
            }

            const deletedEmployee = await this.prisma.employee.update({
                where: { id: employeeId },
                data: {
                    isActive: false
                }
            });

            this.logger.log('Employee soft deleted successfully', {
                employeeId,
                userId,
                employeeName: deletedEmployee.name
            });

            return deletedEmployee;
        } catch (error) {
            this.logger.error('Employee deletion failed', error.stack, { userId, employeeId });
            throw error;
        }
    }

    public async servicesAttendedByProfessional(employeeId: number) {
        try {
            this.logger.log('Getting services attended by professional', { employeeId });

            const employeeServices = await this.prisma.employeeServices.findMany({
                where: { employeeId },
                include: {
                    service: true
                }
            });

            this.logger.log('Services retrieved successfully', {
                employeeId,
                serviceCount: employeeServices.length
            });

            return employeeServices;
        } catch (error) {
            this.logger.error('Error getting services attended by professional', error.stack, { employeeId });
            throw error;
        }
    }

    private async createEmployeeWorkingHours(
        prisma: Prisma.TransactionClient,
        employeeId: number,
        companyId: number,
        workingHoursDto?: { workingHours: DailyWorkingHoursDto[] }
    ): Promise<void> {
        if (!workingHoursDto?.workingHours || workingHoursDto.workingHours.length === 0) {
            return;
        }

        const workingHoursData = workingHoursDto.workingHours.map(wh => ({
            employeeId,
            dayOfWeek: wh.dayOfWeek,
            startTime: wh.startTime,
            endTime: wh.endTime
        }));

        // Validar horários hierárquicos antes de criar
        await this.validateHierarchicalConstraints(companyId, workingHoursDto.workingHours);

        await prisma.employeeWorkingHour.createMany({
            data: workingHoursData
        });

        // Sincronizar horários de categorias com os horários do novo funcionário
        await this.synchronizeEmployeeCategoryHours(employeeId, workingHoursDto.workingHours);
    }

    // ordem de prioridade: categoria -> funcionário -> empresa
    private async getWorkingHoursForDay(
        employeeCategoryWorkingHours: DailyWorkingHoursDto[],
        workingHours: EmployeeWorkingHour[],
        companyId: number,
        dayOfWeek: number,
        categoriesId?: number[]
    ): Promise<DailyWorkingHoursDto | undefined> {
        let workingHoursForDay: DailyWorkingHoursDto | undefined;

        // 1. horários específicos da categoria
        if (categoriesId && employeeCategoryWorkingHours?.length) {
            workingHoursForDay = employeeCategoryWorkingHours.find(wh => wh.dayOfWeek === dayOfWeek);

            // se tiver horarios configurados, mas não tiver pra esse dia, não trabalha (vale para os demais casos também)
            return workingHoursForDay ?? undefined;
        }

        // 2. horários gerais do funcionário
        if (!workingHoursForDay && workingHours?.length) {
            workingHoursForDay = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
            return workingHoursForDay ?? undefined;
        }

        // 3. horários da empresa
        const companyWorkingHours = await this.companyService.getCompanyWorkingHours(companyId);
        workingHoursForDay = companyWorkingHours.find(wh => wh.dayOfWeek === dayOfWeek);
        return workingHoursForDay ?? undefined;
    }

    private async updateEmployeeBasicData(
        prisma: Prisma.TransactionClient,
        employeeId: number,
        profileData: CreateEmployeeDto['profile'],
        serviceInterval: number
    ) {
        return prisma.employee.update({
            where: { id: employeeId },
            data: {
                name: profileData.name,
                phone: profileData.phone,
                displayOnline: profileData.displayOnline,
                position: profileData.position,
                profileImageUrl: profileData.profileImageUrl || null,
                serviceInterval,
            },
        });
    }

    private async updateEmployeeWorkingHours(
        prisma: Prisma.TransactionClient,
        employeeId: number,
        companyId: number,
        workingHours: DailyWorkingHoursDto[]
    ): Promise<void> {
        // Validar horários hierárquicos antes de atualizar
        await this.validateHierarchicalConstraints(companyId, workingHours);

        const incomingDays = workingHours.map(hour => hour.dayOfWeek);

        // Deleta horários antigos que não estão mais presentes
        await prisma.employeeWorkingHour.deleteMany({
            where: {
                employeeId,
                dayOfWeek: {
                    notIn: incomingDays
                }
            }
        });

        // Upsert dos horários enviados
        for (const wh of workingHours) {
            validateDayOfWeek(wh.dayOfWeek);
            validateTimeRange(wh.startTime, wh.endTime);

            await prisma.employeeWorkingHour.upsert({
                where: {
                    employeeId_dayOfWeek: {
                        employeeId,
                        dayOfWeek: wh.dayOfWeek
                    }
                },
                update: {
                    startTime: wh.startTime,
                    endTime: wh.endTime
                },
                create: {
                    employeeId,
                    dayOfWeek: wh.dayOfWeek,
                    startTime: wh.startTime,
                    endTime: wh.endTime
                }
            });
        }

        // Sincronizar horários de categorias com os novos horários do funcionário
        await this.synchronizeEmployeeCategoryHours(employeeId, workingHours);
    }

    private async updateEmployeeServices(
        prisma: Prisma.TransactionClient,
        employeeId: number,
        employeeServices?: { serviceId: number }[]
    ): Promise<void> {
        const incomingServiceIds = employeeServices?.map(es => es.serviceId) || [];

        // Deleta serviços antigos que não estão mais presentes
        await prisma.employeeServices.deleteMany({
            where: {
                employeeId,
                serviceId: {
                    notIn: incomingServiceIds
                }
            }
        });

        if (!employeeServices || employeeServices.length === 0) {
            return; // Se não houver serviços, pula a parte de inserção
        }

        // Buscar serviços que já existem para não duplicar
        const existingServices = await prisma.employeeServices.findMany({
            where: {
                employeeId,
                serviceId: { in: incomingServiceIds }
            },
            select: { serviceId: true }
        });

        const existingServiceIds = existingServices.map(es => es.serviceId);

        // Inserir apenas os novos
        const newServices = employeeServices
            .filter(es => !existingServiceIds.includes(es.serviceId))
            .map(es => ({
                employeeId,
                serviceId: es.serviceId
            }));

        if (newServices.length > 0) {
            await prisma.employeeServices.createMany({
                data: newServices
            });
        }
    }

    private async validateEmployeeRegistration(
        prisma: Prisma.TransactionClient,
        adminId: number,
        employeeName: string,
        companyId: number
    ): Promise<void> {
        const isAdminRequest = await this.userService.isUserAdmin(adminId);

        if (!isAdminRequest) {
            this.logger.warn('Non-admin user attempted to register employee', { adminId });
            throw new UnauthorizedException('Apenas administradores podem cadastrar funcionários');
        }

        const nameExists = await prisma.employee.findFirst({
            where: {
                name: employeeName,
                companyId
            }
        });

        if (nameExists) {
            this.logger.warn('Attempt to register employee with duplicate name', {
                adminId,
                companyId,
                employeeName
            });
            throw new BadRequestException('Já existe um funcionário com este nome cadastrado na empresa');
        }
    }

    private async validateEmployeeUpdate(userId: number, employeeId: number): Promise<void> {
        const isAdminRequest = await this.userService.isUserAdmin(userId);

        if (!isAdminRequest && userId !== employeeId) {
            this.logger.warn('Unauthorized employee update attempt', { userId, employeeId });
            throw new UnauthorizedException('Apenas administradores podem atualizar funcionários');
        }

        await this.getOrThrowEmployeeById(employeeId);
    }

    /**
     * Sincroniza horários de categorias com os horários de funcionário
     * Remove dias que não existem mais no funcionário e ajusta horários que estão fora do novo range
     */
    private async synchronizeEmployeeCategoryHours(
        employeeId: number,
        newEmployeeHours: DailyWorkingHoursDto[]
    ): Promise<void> {
        const prisma = this.transactionService.getPrismaInstance();
        
        this.logger.log('Starting synchronization of employee category hours', { 
            employeeId, 
            newEmployeeHoursCount: newEmployeeHours.length 
        });

        const employeeWorkingDays = newEmployeeHours.map(h => h.dayOfWeek);
        
        // 1. Remover horários de categorias para dias que o funcionário não atende mais
        const deletedCategoryHours = await prisma.employeeCategoryWorkingHour.deleteMany({
            where: {
                employeeId,
                dayOfWeek: { notIn: employeeWorkingDays }
            }
        });
        
        this.logger.log('Deleted category hours for removed days', { 
            employeeId, 
            deletedCount: deletedCategoryHours.count 
        });

        // 2. Ajustar horários de categorias que estão fora do novo range do funcionário
        for (const employeeHour of newEmployeeHours) {
            const categoryHours = await prisma.employeeCategoryWorkingHour.findMany({
                where: {
                    employeeId,
                    dayOfWeek: employeeHour.dayOfWeek
                }
            });

            for (const categoryHour of categoryHours) {
                const adjustedHours = this.adjustHourToEmployeeRange(
                    categoryHour.startTime,
                    categoryHour.endTime,
                    employeeHour.startTime,
                    employeeHour.endTime
                );

                if (adjustedHours) {
                    await prisma.employeeCategoryWorkingHour.update({
                        where: { id: categoryHour.id },
                        data: {
                            startTime: adjustedHours.startTime,
                            endTime: adjustedHours.endTime
                        }
                    });

                    this.logger.log('Adjusted category working hour', {
                        employeeId,
                        categoryHourId: categoryHour.id,
                        dayOfWeek: employeeHour.dayOfWeek,
                        originalStart: categoryHour.startTime,
                        originalEnd: categoryHour.endTime,
                        adjustedStart: adjustedHours.startTime,
                        adjustedEnd: adjustedHours.endTime
                    });
                }
            }
        }

        this.logger.log('Synchronization of employee category hours completed', { employeeId });
    }

    private adjustHourToEmployeeRange(
        currentStart: string,
        currentEnd: string,
        employeeStart: string,
        employeeEnd: string
    ): { startTime: string; endTime: string } | null {
        const currentStartMinutes = parseTimeToMinutes(currentStart);
        const currentEndMinutes = parseTimeToMinutes(currentEnd);
        const employeeStartMinutes = parseTimeToMinutes(employeeStart);
        const employeeEndMinutes = parseTimeToMinutes(employeeEnd);

        // Se o horário atual está completamente dentro do horário da empresa, não precisa ajustar
        if (currentStartMinutes >= employeeStartMinutes && currentEndMinutes <= employeeEndMinutes) {
            return null; // Não precisa ajustar
        }

        // Calcular novo horário ajustado
        let newStartMinutes = Math.max(currentStartMinutes, employeeStartMinutes);
        let newEndMinutes = Math.min(currentEndMinutes, employeeEndMinutes);

        // Se o início ajustado for maior ou igual ao fim, não é possível ajustar
        if (newStartMinutes >= newEndMinutes) {
            return null;
        }

        // Converter de volta para string HH:mm
        const newStartTime = `${Math.floor(newStartMinutes / 60).toString().padStart(2, '0')}:${(newStartMinutes % 60).toString().padStart(2, '0')}`;
        const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;

        return { startTime: newStartTime, endTime: newEndTime };
    }
}

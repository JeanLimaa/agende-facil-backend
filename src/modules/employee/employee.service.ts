import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Employee, EmployeeWorkingHour, Prisma, Status } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

import { format, isBefore, isAfter, addMinutes, startOfDay, endOfDay, parseISO, isEqual, isSameDay } from 'date-fns';
import { is, ptBR } from 'date-fns/locale';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { parseTimeToMinutes, validateDayOfWeek, validateTimeRange } from 'src/common/helpers/time.helper';
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
        if(isBefore(parsedDate, today)) throw new BadRequestException('A data não pode ser anterior a hoje.');

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

    public async createEmployee(data: Prisma.EmployeeCreateManyInput){
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

    public async registerEmployee(adminId: number, dto: CreateEmployeeDto) {
        try {
            const prisma = this.transactionService.getPrismaInstance();

            this.logger.log('Starting employee registration', { 
                adminId, 
                employeeName: dto.profile.name 
            });

            const isAdminRequest = await this.userService.isUserAdmin(adminId);

            if (!isAdminRequest) {
                this.logger.warn('Non-admin user attempted to register employee', { adminId });
                throw new UnauthorizedException('Apenas administradores podem cadastrar funcionários');
            }

            const companyId = await this.companyService.findCompanyIdByUserId(adminId);
            
            this.logger.log('Creating employee profile with transaction', { 
                adminId, 
                companyId, 
                employeeName: dto.profile.name 
            });

            const nameExists = await prisma.employee.findFirst({
                where: { 
                    name: dto.profile.name,
                    companyId
                }
            });

            if (nameExists) {
                this.logger.warn('Attempt to register employee with duplicate name', { 
                    adminId, 
                    companyId,
                    employeeName: dto.profile.name
                });
                throw new BadRequestException('Já existe um funcionário com este nome cadastrado na empresa');
            }

            const employee = await this.transactionService.runInTransaction(async () => {
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
                    if(dto.workingHours?.workingHours && dto.workingHours.workingHours.length > 0) {
                        const workingHoursData = Object.keys(dto.workingHours.workingHours).map(dayOfWeek => {
                            const wh: DailyWorkingHoursDto = dto.workingHours.workingHours[dayOfWeek];
                            return {
                                employeeId: newEmployee.id,
                                dayOfWeek: Number(dayOfWeek),
                                startTime: wh.startTime,
                                endTime: wh.endTime
                            };
                        });

                        await prisma.employeeWorkingHour.createMany({
                            data: workingHoursData
                        });
                    }

                    return newEmployee;
                }
            );

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

            const isAdminRequest = await this.userService.isUserAdmin(userId);

            if (!isAdminRequest && userId !== employeeId) {
                this.logger.warn('Unauthorized employee update attempt', { userId, employeeId });
                throw new UnauthorizedException('Apenas administradores podem atualizar funcionários');
            }

            await this.getOrThrowEmployeeById(employeeId);

            const updatedEmployee = await this.transactionService.runInTransaction(async () => {
                    // Atualizar dados básicos do funcionário
                    const employee = await prisma.employee.update({
                        where: { id: employeeId },
                        data: {
                            name: dto.profile.name,
                            phone: dto.profile.phone,
                            displayOnline: dto.profile.displayOnline,
                            position: dto.profile.position,
                            profileImageUrl: dto.profile.profileImageUrl || null,
                            serviceInterval: dto.workingHours.serviceInterval,
                        },
                    });

                    // Atualizar horários de trabalho
                    const { workingHours } = dto.workingHours;
                    if (workingHours && workingHours.length > 0) {
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
                    }

                    // Atualizar serviços do funcionário
                    if (dto.employeeServices && dto.employeeServices.length > 0) {
                        const incomingServiceIds = dto.employeeServices.map(es => es.serviceId);

                        // Deleta serviços antigos que não estão mais presentes
                        await prisma.employeeServices.deleteMany({
                            where: {
                                employeeId,
                                serviceId: {
                                    notIn: incomingServiceIds
                                }
                            }
                        });

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
                        const newServices = dto.employeeServices
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

                    return employee;
                }
            );

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
}

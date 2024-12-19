import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeService } from '../employee/employee.service';
import { Prisma } from '@prisma/client';
import { EmployeeServiceDTO } from './dto/create-employee-service.dto';

@Injectable()
export class EmployeeServicesService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly employeeService: EmployeeService,
    ) {}

    public async createMany(employeeServicePairs: EmployeeServiceDTO) {
        const employeeId = employeeServicePairs.employeeId;

        const createPromises = employeeServicePairs.services.map(pair => 
            this.prisma.employeeServices.create({
                data: {
                    employeeId: employeeId,
                    serviceId: pair.serviceId,
                },
            })
        );
        return await Promise.all(createPromises);
    }

    public async deleteMany(employeeServicePairs: EmployeeServiceDTO) {
        const employeeId = employeeServicePairs.employeeId;

        const deletePromises = employeeServicePairs.services.map(pair => 
            this.prisma.employeeServices.deleteMany({
                where: {
                    employeeId: employeeId,
                    serviceId: pair.serviceId,
                },
            })
        );
        return await Promise.all(deletePromises);
    }

    public async listAllEmployeeToService(serviceId: number) {
        const employeeServices = await this.prisma.employeeServices.findMany({
            where: { serviceId },
            include: { employee: true }
        });

        return employeeServices.map(employeeService => employeeService.employee);
    }

    /*     public async create(employeeId: number, serviceId: number): Promise<void> {
        const employee = await this.employeeService.getEmployeeById(employeeId);

        if (!employee) {
            throw new NotFoundException('Funcionário não encontrado');
        }

        const service = await this.prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            throw new NotFoundException('Serviço não encontrado');
        }

        try {
            await this.prisma.employeeServices.create({
                data: {
                    employeeId,
                    serviceId,
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Relação entre funcionário e serviço já existe');
            }
            throw error;
        }
    } */
}

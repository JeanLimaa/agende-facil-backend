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

        const employee = await this.employeeService.getEmployeeById(employeeId);
        if (!employee) {
            throw new NotFoundException('Funcionário não encontrado');
        }

        const createPromises = employeeServicePairs.services.map(async pair => {
            const existingRelation = await this.prisma.employeeServices.findUnique({
                where: {
                    employeeId_serviceId: {
                        employeeId: employeeId,
                        serviceId: pair.serviceId,
                    },
                },
            });

            if (existingRelation) {
                throw new ConflictException('Relação entre funcionário e serviço já existe');
            }

            return this.prisma.employeeServices.create({
                data: {
                    employeeId: employeeId,
                    serviceId: pair.serviceId,
                },
            });
        });

        return await Promise.all(createPromises);
    }

    public async deleteMany(employeeServicePairs: EmployeeServiceDTO) {
        const employeeId = employeeServicePairs.employeeId;

        const employee = await this.employeeService.getEmployeeById(employeeId);
        if (!employee) {
            throw new NotFoundException('Funcionário não encontrado');
        }

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
}

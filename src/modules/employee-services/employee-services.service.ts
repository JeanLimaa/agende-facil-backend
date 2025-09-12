import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeServicesDTO } from './dto/create-employee-service.dto';

@Injectable()
export class EmployeeServicesService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly employeeService: EmployeeService,
    ) {}

    public async createMany(employeeServicePairs: EmployeeServicesDTO) {
        const employeeId = employeeServicePairs.employeeId;

        await this.employeeService.getOrThrowEmployeeById(employeeId);

        // Verificar se todos os serviceIds existem
        const serviceIds = employeeServicePairs.services.map(pair => pair.serviceId);
        const existingServices = await this.prisma.service.findMany({
            where: {
            id: {
                in: serviceIds,
            },
            },
        });

        if (existingServices.length !== serviceIds.length) {
            throw new NotFoundException('Um ou mais serviceIds não existem na tabela Service.');
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
            
            return await this.prisma.employeeServices.create({
                data: {
                    employeeId: employeeId,
                    serviceId: pair.serviceId,
                },
            });
        });

        return await Promise.all(createPromises);
    }

    public async deleteMany(employeeServicePairs: EmployeeServicesDTO) {
        const employeeId = employeeServicePairs.employeeId;

        await this.employeeService.getOrThrowEmployeeById(employeeId);

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

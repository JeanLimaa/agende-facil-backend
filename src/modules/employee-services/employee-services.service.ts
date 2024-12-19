import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class EmployeeServicesService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly employeeService: EmployeeService,
    ) {}

    public async create(employeeId: number, serviceId: number): Promise<void> {
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

        await this.prisma.employeeServices.create({
            data: {
                employeeId,
                serviceId,
            }
        });
    }

    public async listAllEmployeeToService(serviceId: number) {
        const employeeServices = await this.prisma.employeeServices.findMany({
            where: { serviceId },
            include: { employee: true }
        });

        return employeeServices.map(employeeService => employeeService.employee);
    }
}

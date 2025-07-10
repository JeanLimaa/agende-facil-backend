import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeCategoryDTO } from './dto/create-employee-service.dto';

@Injectable()
export class EmployeeServicesService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly employeeService: EmployeeService,
    ) {}

    public async createMany(employeeServicePairs: EmployeeCategoryDTO) {
        const employeeId = employeeServicePairs.employeeId;

        await this.employeeService.getOrThrowEmployeeById(employeeId);

        // Verificar se todos os categoryIds existem
        const categoryIds = employeeServicePairs.categorys.map(pair => pair.categoryId);
        const existingCategories = await this.prisma.category.findMany({
            where: {
            id: {
                in: categoryIds,
            },
            },
        });

        if (existingCategories.length !== categoryIds.length) {
            throw new NotFoundException('Um ou mais categoryIds não existem na tabela Category.');
        }

        const createPromises = employeeServicePairs.categorys.map(async pair => {
            const existingRelation = await this.prisma.employeeCategory.findUnique({
                where: {
                    employeeId_categoryId: {
                        employeeId: employeeId,
                        categoryId: pair.categoryId,
                    },
                },
            });
            
            if (existingRelation) {
                throw new ConflictException('Relação entre funcionário e serviço já existe');
            }
            
            return await this.prisma.employeeCategory.create({
                data: {
                    employeeId: employeeId,
                    categoryId: pair.categoryId,
                },
            });
        });

        return await Promise.all(createPromises);
    }

    public async deleteMany(employeeServicePairs: EmployeeCategoryDTO) {
        const employeeId = employeeServicePairs.employeeId;

        await this.employeeService.getOrThrowEmployeeById(employeeId);

        const deletePromises = employeeServicePairs.categorys.map(pair => 
            this.prisma.employeeCategory.deleteMany({
                where: {
                    employeeId: employeeId,
                    categoryId: pair.categoryId,
                },
            })
        );
        return await Promise.all(deletePromises);
    }

    public async listAllEmployeeToCategory(categoryId: number) {
        const employeeServices = await this.prisma.employeeCategory.findMany({
            where: { categoryId },
            include: { employee: true }
        });

        return employeeServices.map(employeeService => employeeService.employee);
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Service } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class ServiceService {
    constructor(
        private readonly prisma: DatabaseService
    ) {}

    public async create(data: Prisma.ServiceCreateManyInput): Promise<Prisma.ServiceCreateManyInput> {
        return await this.prisma.service.create({
            data
        });
    }

    public async update(id: number, data: Prisma.ServiceUncheckedUpdateManyInput): Promise<Prisma.ServiceUncheckedUpdateManyInput> {
        const service = await this.prisma.service.findUnique({
            where: { id }
        })

        if (!service) {
            throw new NotFoundException('Serviço não encontrado');
        }
        
        return await this.prisma.service.update({
            where: { id },
            data,
        });
    }

    public async delete(id: number): Promise<Service> {
        const service = await this.prisma.service.findUnique({
            where: { id }
        })

        if (!service) {
            throw new NotFoundException('Serviço não encontrado');
        }

        return await this.prisma.service.delete({
            where: { id }
        });
    }

    public async listByCompanyId(companyId: number): Promise<Service[]> {
        return await this.prisma.service.findMany(
            {
                where: {
                    companyId: companyId
            }
        }
        );
    }

    public async listByCategoryId(categoryId: number): Promise<Service[]> {
        return await this.prisma.service.findMany(
            {
                where: {
                    categoryId: categoryId
                }
            }
        )
    }

    public async getById(id: number): Promise<Service> {
        return await this.prisma.service.findUniqueOrThrow({
            where: { id }
        });
    }
}
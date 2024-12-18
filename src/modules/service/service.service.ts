import { Injectable } from '@nestjs/common';
import { Prisma, Service } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class ServiceService {
    constructor(
        private readonly prisma: DatabaseService
    ) {}

    async create(data: Prisma.ServiceCreateManyInput): Promise<Prisma.ServiceCreateManyInput> {
        return await this.prisma.service.create({
            data
        });
    }

    async update(id: number, data: Prisma.ServiceUncheckedUpdateManyInput): Promise<Prisma.ServiceUncheckedUpdateManyInput> {
        return await this.prisma.service.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<Service> {
        return await this.prisma.service.delete({
            where: { id }
        });
    }

    async listByCompany(companyId: number): Promise<Service[]> {
        return await this.prisma.service.findMany(
            {
                where: {
                    companyId: companyId
            }
        }
        );
    }
}

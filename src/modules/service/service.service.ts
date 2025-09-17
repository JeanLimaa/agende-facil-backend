import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Service } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';
import { CategoryService } from '../category/category.service';
import { CreateServiceDTO } from './dto/create-service.dto';
import { UpdateServiceDTO } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly categoriesService: CategoryService
    ) {}

    public async create(data: CreateServiceDTO, companyId: number): Promise<Service> {
        const existingService = await this.prisma.service.findFirst({
            where: {
                name: data.details.name,
                companyId
            }
        });

        if (existingService) {
            throw new BadRequestException('Serviço com esse nome já existe');
        }

        const existCategory = await this.categoriesService.getCategoryById(data.details.categoryId);

        if (!existCategory) {
            throw new BadRequestException('Categoria não encontrada');
        }

        return await this.prisma.service.create({
            data: {
                ...data.details,
                ...data.pricing,
                companyId
            }
        });
    }

    public async update(id: number, data: UpdateServiceDTO, companyId: number): Promise<Service> {
        const service = await this.prisma.service.findUnique({
            where: { id }
        })

        if (!service) {
            throw new NotFoundException('Serviço não encontrado');
        }

        const existCategory = await this.categoriesService.getCategoryById(data.details.categoryId);

        if (!existCategory) {
            throw new BadRequestException('Categoria não encontrada');
        }

        if(service.companyId !== companyId) {
            throw new BadRequestException('Você não tem permissão para editar este serviço');
        }
        
        return await this.prisma.service.update({
            where: { id },
            data: {
                ...data.details,
                ...data.pricing
            },
        });
    }

    public async delete(id: number): Promise<Service> {
        const service = await this.prisma.service.findUnique({
            where: { id }
        })

        if (!service) {
            throw new NotFoundException('Serviço não encontrado');
        }

        return await this.prisma.service.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false
            }
        });
    }

    public async listByCompanyId(companyId: number): Promise<Service[]> {
        return await this.prisma.service.findMany(
            {
                where: {
                    companyId: companyId, isActive: true
            }
        }
        );
    }

    public async listByCategoryId(categoryId: number): Promise<Service[]> {
        return await this.prisma.service.findMany(
            {
                where: {
                    categoryId: categoryId, isActive: true
                }
            }
        )
    }

    public async getById(id: number): Promise<Service> {
        return await this.prisma.service.findUniqueOrThrow({
            where: { id, isActive: true }
        });
    }
}
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyService } from '../company/company.service';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly companyService: CompanyService
    ) {}

    public async create(name: string, companyId: number): Promise<Omit<Category, 'companyId'>> {
        if(!companyId){
            throw new NotFoundException("Empresa não encontrada");
        }

        try {
            const category = await this.prisma.category.create({
                data: {
                    name,
                    companyId,
                }
            });
            const { companyId: _, ...result } = category;
            return result;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException("Categoria já existe para esta empresa");
            }
            throw error;
        }
    }

    public async update(categoryId: number, name: string): Promise<Omit<Category, 'companyId'>> {
        if (!categoryId) {
            throw new NotFoundException("Categoria não encontrada");
        }

        const category = await this.prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            throw new NotFoundException("Categoria não encontrada");
        }
        
        const updatedCategory = await this.prisma.category.update({
            where: {
                id: categoryId
            },
            data: {
                name
            }
        });

        const { companyId: _, ...result } = updatedCategory;
        return result;
    }

    public async delete(categoryId: number): Promise<void> {
        if (!categoryId) {
            throw new NotFoundException("Categoria não encontrada");
        }

        await this.prisma.category.delete({
            where: {
                id: Number(categoryId)
            }
        });
    }

    public async getCategoryById(categoryId: number): Promise<Omit<Category, 'companyId'>> {
        const category = await this.prisma.category.findUnique({
            where: {
                id: categoryId
            }
        });

        if (!category) {
            throw new NotFoundException("Categoria não encontrada");
        }

        const { companyId: _, ...result } = category;
        return result;
    }

    public async listByCompany(companyLinkName: string): Promise<Omit<Category, 'companyId'>[]> {
        const company = await this.companyService.getCompanyByLinkName(companyLinkName);

        const categories = await this.prisma.category.findMany({
            where: {
                companyId: company.id
            }
        });

        return categories.map(({ companyId, ...category }) => category);
    }
}

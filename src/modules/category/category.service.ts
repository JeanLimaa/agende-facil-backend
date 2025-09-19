import { Injectable, NotFoundException, ConflictException, forwardRef, Inject, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyService } from '../company/company.service';
import { Category, Prisma } from '@prisma/client';
import { TransactionService } from 'src/common/services/transaction-context.service';

@Injectable()
export class CategoryService {
    private readonly logger = new Logger(CategoryService.name);

    constructor(
        private readonly prisma: DatabaseService,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
        private readonly transactionService: TransactionService
    ) {}

    public async create(name: string, companyId: number): Promise<Omit<Category, 'companyId'>> {
        try {
            const prisma = this.transactionService.getPrismaInstance();

            this.logger.log('Creating new category', { name, companyId });

            if(!companyId){
                this.logger.warn('Attempt to create category without company ID', { name });
                throw new NotFoundException("Empresa não encontrada");
            }

            const category = await prisma.category.create({
                data: {
                    name,
                    companyId,
                }
            });

            this.logger.log('Category created successfully', { 
                categoryId: category.id, 
                name, 
                companyId 
            });

            const { companyId: _, ...result } = category;
            return result;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                this.logger.warn('Attempt to create duplicate category', { name, companyId });
                throw new ConflictException("Categoria já existe para esta empresa");
            }
            this.logger.error('Error creating category', error.stack, { name, companyId });
            throw error;
        }
    }

    public async update(categoryId: number, name: string): Promise<Omit<Category, 'companyId'>> {
        try {
            this.logger.log('Updating category', { categoryId, name });

            if (!categoryId) {
                this.logger.warn('Attempt to update category without ID', { name });
                throw new NotFoundException("Categoria não encontrada");
            }

            const category = await this.prisma.category.findUnique({
                where: { id: categoryId }
            });

            if (!category) {
                this.logger.warn('Category not found for update', { categoryId, name });
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

            this.logger.log('Category updated successfully', { 
                categoryId, 
                oldName: category.name, 
                newName: name 
            });

            const { companyId: _, ...result } = updatedCategory;
            return result;
        } catch (error) {
            this.logger.error('Error updating category', error.stack, { categoryId, name });
            throw error;
        }
    }

    public async delete(categoryId: number, moveAppointmentsToCategoryId: number, companyId: number): Promise<void> {
        try {
            this.logger.log('Deleting category', { 
                categoryId, 
                moveAppointmentsToCategoryId, 
                companyId 
            });

            const existingCategory = await this.prisma.category.findUnique({
                where: { id: categoryId }
            });

            if (!existingCategory) {
                this.logger.warn('Category not found for deletion', { categoryId });
                throw new NotFoundException("Categoria não encontrada");
            }

            // Verifica se a categoria de destino existe
            const targetCategory = await this.prisma.category.findUnique({
                where: { id: moveAppointmentsToCategoryId }
            });

            if (!targetCategory) {
                this.logger.warn('Target category not found', { moveAppointmentsToCategoryId });
                throw new NotFoundException("Categoria de destino não encontrada");
            }

            if(categoryId === moveAppointmentsToCategoryId){
                this.logger.warn('Attempt to move category to itself', { categoryId });
                throw new ConflictException("Não é possível mover uma categoria para a mesma categoria");
            }

            if(existingCategory.companyId !== targetCategory.companyId || companyId !== existingCategory.companyId){
                this.logger.warn('Attempt to move between different companies', { 
                    categoryId, 
                    moveAppointmentsToCategoryId, 
                    companyId, 
                    existingCompanyId: existingCategory.companyId, 
                    targetCompanyId: targetCategory.companyId 
                });
                throw new ConflictException("Não é possível mover agendamentos para uma categoria de outra empresa");
            }

            this.logger.log('Moving services to target category', { 
                categoryId, 
                moveAppointmentsToCategoryId 
            });

            await this.prisma.$transaction(async (tx) => {
                // Move os serviços para a nova categoria
                const updatedServices = await tx.service.updateMany({
                    where: { categoryId },
                    data: { categoryId: moveAppointmentsToCategoryId }
                });

                this.logger.log('Services moved successfully', { 
                    categoryId, 
                    moveAppointmentsToCategoryId, 
                    servicesCount: updatedServices.count 
                });

                // Deleta a categoria 
                await tx.category.delete({
                    where: {
                        id: categoryId
                    }
                });

                this.logger.log('Category deleted successfully', { 
                    categoryId, 
                    categoryName: existingCategory.name 
                });
            });
        } catch (error) {
            this.logger.error('Error deleting category', error.stack, { 
                categoryId, 
                moveAppointmentsToCategoryId, 
                companyId 
            });
            throw error;
        }
    }

    public async getCategoryById(categoryId: number): Promise<Omit<Category, 'companyId'>> {
        try {
            this.logger.log('Getting category by ID', { categoryId });

            const category = await this.prisma.category.findUnique({
                where: {
                    id: categoryId
                }
            });

            if (!category) {
                this.logger.warn('Category not found', { categoryId });
                throw new NotFoundException("Categoria não encontrada");
            }

            this.logger.log('Category found successfully', { 
                categoryId, 
                categoryName: category.name 
            });

            const { companyId: _, ...result } = category;
            return result;
        } catch (error) {
            this.logger.error('Error getting category by ID', error.stack, { categoryId });
            throw error;
        }
    }

    public async listByCompany(companyLinkName: string): Promise<Omit<Category, 'companyId'>[]> {
        try {
            this.logger.log('Listing categories by company link', { companyLinkName });

            const company = await this.companyService.getCompanyByLinkName(companyLinkName);

            const categories = await this.prisma.category.findMany({
                where: {
                    companyId: company.id
                }
            });

            this.logger.log('Categories listed successfully', { 
                companyLinkName, 
                companyId: company.id, 
                categoriesCount: categories.length 
            });

            return categories.map(({ companyId, ...category }) => category);
        } catch (error) {
            this.logger.error('Error listing categories by company', error.stack, { companyLinkName });
            throw error;
        }
    }

    public async listAllFromCompany(companyId: number): Promise<Omit<Category, 'companyId'>[]> {
        try {
            this.logger.log('Listing all categories from company', { companyId });

            const categories = await this.prisma.category.findMany({
                where: { companyId }
            });

            this.logger.log('All categories from company listed successfully', { 
                companyId, 
                categoriesCount: categories.length 
            });

            return categories.map(({ companyId, ...category }) => category);
        } catch (error) {
            this.logger.error('Error listing all categories from company', error.stack, { companyId });
            throw error;
        }
    }
}


import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/services/Database.service';
import { CreateEmployeeCategoryWorkingHourDto } from './dto/create-employee-category-working-hour.dto';
import { UpdateEmployeeCategoryWorkingHourDto } from './dto/update-employee-category-working-hour.dto';
import { BulkCreateEmployeeCategoryWorkingHourDto } from './dto/bulk-create-employee-category-working-hour.dto';
import { validateTimeRange } from 'src/common/helpers/time.helper';

@Injectable()
export class EmployeeCategoryWorkingHourService {
  private readonly logger = new Logger(EmployeeCategoryWorkingHourService.name);

  constructor(private readonly prisma: DatabaseService) {}

  public async create(data: CreateEmployeeCategoryWorkingHourDto) {
    try {
      this.logger.log('Creating employee category working hour', {
        employeeId: data.employeeId,
        categoryId: data.categoryId,
        dayOfWeek: data.dayOfWeek
      });

      // Validar se o horário é válido
      try {
        validateTimeRange(data.startTime, data.endTime);
      } catch (error) {
        throw new BadRequestException(error.message);
      }

      const employee = await this.prisma.employee.findUnique({
        where: { id: data.employeeId }
      });

      if (!employee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }

      // Verificar se já existe um horário para este funcionário, categoria e dia
      const existingWorkingHour = await this.prisma.employeeCategoryWorkingHour.findUnique({
        where: {
          employeeId_categoryId_dayOfWeek: {
            employeeId: data.employeeId,
            categoryId: data.categoryId,
            dayOfWeek: data.dayOfWeek
          }
        }
      });

      if (existingWorkingHour) {
        throw new BadRequestException(
          `Já existe um horário definido para este funcionário nesta categoria no dia ${data.dayOfWeek}`
        );
      }

      const workingHour = await this.prisma.employeeCategoryWorkingHour.create({
        data,
        include: {
          employee: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } }
        }
      });

      this.logger.log('Employee category working hour created successfully', {
        id: workingHour.id,
        employeeId: data.employeeId,
        categoryId: data.categoryId
      });

      return workingHour;
    } catch (error) {
      this.logger.error('Error creating employee category working hour', error.stack);
      throw error;
    }
  }

  public async bulkCreate(data: BulkCreateEmployeeCategoryWorkingHourDto) {
    try {
      this.logger.log('Bulk creating employee category working hours', {
        count: data.workingHours.length
      });

      const results = [];
      const errors = [];

      for (const workingHour of data.workingHours) {
        try {
          const result = await this.create(workingHour);
          results.push(result);
        } catch (error) {
          errors.push({
            workingHour,
            error: error.message
          });
        }
      }

      this.logger.log('Bulk create completed', {
        successful: results.length,
        failed: errors.length
      });

      return {
        successful: results,
        failed: errors,
        summary: {
          total: data.workingHours.length,
          successful: results.length,
          failed: errors.length
        }
      };
    } catch (error) {
      this.logger.error('Error in bulk create employee category working hours', error.stack);
      throw error;
    }
  }

  public async findByEmployeeId(employeeId: number) {
    try {
      this.logger.log('Finding working hours by employee ID', { employeeId });

      const workingHours = await this.prisma.employeeCategoryWorkingHour.findMany({
        where: { employeeId },
        include: {
          category: { select: { id: true, name: true } }
        },
        orderBy: [
          { categoryId: 'asc' },
          { dayOfWeek: 'asc' }
        ]
      });

      this.logger.log('Working hours found', {
        employeeId,
        count: workingHours.length
      });

      return workingHours;
    } catch (error) {
      this.logger.error('Error finding working hours by employee ID', error.stack);
      throw error;
    }
  }

  public async findByCategoryId(categoryId: number) {
    try {
      this.logger.log('Finding working hours by category ID', { categoryId });

      const workingHours = await this.prisma.employeeCategoryWorkingHour.findMany({
        where: { categoryId },
        include: {
          employee: { select: { id: true, name: true } }
        },
        orderBy: [
          { employeeId: 'asc' },
          { dayOfWeek: 'asc' }
        ]
      });

      this.logger.log('Working hours found', {
        categoryId,
        count: workingHours.length
      });

      return workingHours;
    } catch (error) {
      this.logger.error('Error finding working hours by category ID', error.stack);
      throw error;
    }
  }

  public async findByEmployeeAndCategory(employeeId: number, categoryId: number) {
    try {
      this.logger.log('Finding working hours by employee and category', {
        employeeId,
        categoryId
      });

      const workingHours = await this.prisma.employeeCategoryWorkingHour.findMany({
        where: {
          employeeId,
          categoryId
        },
        include: {
          employee: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } }
        },
        orderBy: { dayOfWeek: 'asc' }
      });

      this.logger.log('Working hours found', {
        employeeId,
        categoryId,
        count: workingHours.length
      });

      return workingHours;
    } catch (error) {
      this.logger.error('Error finding working hours by employee and category', error.stack);
      throw error;
    }
  }

  public async update(id: number, data: UpdateEmployeeCategoryWorkingHourDto) {
    try {
      this.logger.log('Updating employee category working hour', { id });

      const existingWorkingHour = await this.prisma.employeeCategoryWorkingHour.findUnique({
        where: { id }
      });

      if (!existingWorkingHour) {
        throw new NotFoundException('Horário de trabalho não encontrado');
      }

      // Validar horário se fornecido
      if (data.startTime && data.endTime) {
        try {
          validateTimeRange(data.startTime, data.endTime);
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }

      const updatedWorkingHour = await this.prisma.employeeCategoryWorkingHour.update({
        where: { id },
        data,
        include: {
          employee: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } }
        }
      });

      this.logger.log('Employee category working hour updated successfully', { id });

      return updatedWorkingHour;
    } catch (error) {
      this.logger.error('Error updating employee category working hour', error.stack);
      throw error;
    }
  }

  public async delete(id: number) {
    try {
      this.logger.log('Deleting employee category working hour', { id });

      const existingWorkingHour = await this.prisma.employeeCategoryWorkingHour.findUnique({
        where: { id }
      });

      if (!existingWorkingHour) {
        throw new NotFoundException('Horário de trabalho não encontrado');
      }

      await this.prisma.employeeCategoryWorkingHour.delete({
        where: { id }
      });

      this.logger.log('Employee category working hour deleted successfully', { id });

      return { message: 'Horário de trabalho deletado com sucesso' };
    } catch (error) {
      this.logger.error('Error deleting employee category working hour', error.stack);
      throw error;
    }
  }

  public async deleteByEmployeeAndCategory(employeeId: number, categoryId: number) {
    try {
      this.logger.log('Deleting all working hours for employee and category', {
        employeeId,
        categoryId
      });

      const result = await this.prisma.employeeCategoryWorkingHour.deleteMany({
        where: {
          employeeId,
          categoryId
        }
      });

      this.logger.log('Working hours deleted successfully', {
        employeeId,
        categoryId,
        deletedCount: result.count
      });

      return {
        message: `${result.count} horário(s) de trabalho deletado(s) com sucesso`,
        deletedCount: result.count
      };
    } catch (error) {
      this.logger.error('Error deleting working hours by employee and category', error.stack);
      throw error;
    }
  }

  public async getAvailableEmployeesForCategory(categoryId: number, dayOfWeek: number) {
    try {
      this.logger.log('Getting available employees for category', {
        categoryId,
        dayOfWeek
      });

      const availableEmployees = await this.prisma.employee.findMany({
        where: {
          isActive: true,
          employeeCategoryWorkingHours: {
            some: {
              categoryId,
              dayOfWeek
            }
          }
        },
        include: {
          employeeCategoryWorkingHours: {
            where: {
              categoryId,
              dayOfWeek
            }
          }
        }
      });

      this.logger.log('Available employees found', {
        categoryId,
        dayOfWeek,
        count: availableEmployees.length
      });

      return availableEmployees;
    } catch (error) {
      this.logger.error('Error getting available employees for category', error.stack);
      throw error;
    }
  }
}
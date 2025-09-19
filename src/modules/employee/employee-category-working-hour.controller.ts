import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/Roles.decorator';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { EmployeeCategoryWorkingHourService } from './employee-category-working-hour.service';
import { CreateEmployeeCategoryWorkingHourDto } from './dto/create-employee-category-working-hour.dto';
import { UpdateEmployeeCategoryWorkingHourDto } from './dto/update-employee-category-working-hour.dto';
import { BulkCreateEmployeeCategoryWorkingHourDto } from './dto/bulk-create-employee-category-working-hour.dto';

@Controller('employee-category-working-hours')
@UseGuards(JwtAuthGuard, RoleGuard)
export class EmployeeCategoryWorkingHourController {
  constructor(
    private readonly employeeCategoryWorkingHourService: EmployeeCategoryWorkingHourService
  ) {}

  @Post()
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async create(@Body() createDto: CreateEmployeeCategoryWorkingHourDto) {
    return this.employeeCategoryWorkingHourService.create(createDto);
  }

  @Post('bulk')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async bulkCreate(@Body() bulkCreateDto: BulkCreateEmployeeCategoryWorkingHourDto) {
    return this.employeeCategoryWorkingHourService.bulkCreate(bulkCreateDto);
  }

  @Get('employee/:employeeId')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async findByEmployeeId(@Param('employeeId', ParseIntPipe) employeeId: number) {
    console.log('Fetching working hours for employee ID:', employeeId);
    return this.employeeCategoryWorkingHourService.findByEmployeeId(employeeId);
  }

  @Get('category/:categoryId')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async findByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.employeeCategoryWorkingHourService.findByCategoryId(categoryId);
  }

  @Get('employee/:employeeId/category/:categoryId')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async findByEmployeeAndCategory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number
  ) {
    return this.employeeCategoryWorkingHourService.findByEmployeeAndCategory(employeeId, categoryId);
  }

  @Get('available-employees')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async getAvailableEmployeesForCategory(
    @Query('categoryId', ParseIntPipe) categoryId: number,
    @Query('dayOfWeek', ParseIntPipe) dayOfWeek: number
  ) {
    return this.employeeCategoryWorkingHourService.getAvailableEmployeesForCategory(categoryId, dayOfWeek);
  }

  @Put(':id')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmployeeCategoryWorkingHourDto
  ) {
    return this.employeeCategoryWorkingHourService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.employeeCategoryWorkingHourService.delete(id);
  }

  @Delete('employee/:employeeId/category/:categoryId')
  @Roles([Role.ADMIN, Role.EMPLOYEE])
  async deleteByEmployeeAndCategory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number
  ) {
    return this.employeeCategoryWorkingHourService.deleteByEmployeeAndCategory(employeeId, categoryId);
  }
}
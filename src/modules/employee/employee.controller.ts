import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { GetUser } from 'src/common/decorators/GetUser.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SkipAuth } from 'src/common/decorators/SkipAuth.decorator';
import { Roles } from 'src/common/decorators/Roles.decorator';
import { RoleGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async listAll(
    @GetUser("companyId") companyId: number,
  ) {
    return await this.employeeService.listByCompanyId(companyId);
  }

  @Get('/:employeeId')
  async getEmployeeById(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return await this.employeeService.getOrThrowEmployeeById(employeeId);
  }

  @SkipAuth()
  @Get('/:employeeId/available-times')
  async getAvailableTimes(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('date') date: string,
  ) {
    const availableTimes = await this.employeeService.getAvailableTimes(
      employeeId,
      date,
    );
    
    return { availableTimes };
  }

  @SkipAuth()
  @Get('/company/:companyId')
  async listByCompanyId(@Param('companyId', ParseIntPipe) companyId: number) {
    return await this.employeeService.listByCompanyId(companyId);
  }

  @Roles(['ADMIN'])
  @Post()
  async registerEmployee(
    @GetUser("userId") userId: number, 
    @Body() body: CreateEmployeeDto
  ) {
    return this.employeeService.registerEmployee(userId, body);
  }

  @Roles(['ADMIN'])
  @Put('/:employeeId')
  async updateEmployee(
    @GetUser("userId") userId: number, 
    @Param('employeeId', ParseIntPipe) employeeId: number, 
    @Body() body: UpdateEmployeeDto
  ) {
    return this.employeeService.updateEmployee(userId, employeeId, body);
  }

  @Roles(['ADMIN'])
  @Delete('/:employeeId')
  async deleteEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @GetUser("userId") userId: number
  ) {
    return this.employeeService.deleteEmployee(userId, employeeId);
  }
}

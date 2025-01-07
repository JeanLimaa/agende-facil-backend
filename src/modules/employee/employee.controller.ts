import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get(':employeeId/available-times')
  async getAvailableTimes(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('serviceId') serviceId: number,
    @Query('date') date: string,
  ) {
    const availableTimes = await this.employeeService.getAvailableTimes(
      employeeId,
      serviceId,
      new Date(date),
    );
    
    return { availableTimes };
  }

  @Get(':employeeId')
  async getEmployeeById(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return await this.employeeService.getEmployeeById(employeeId);
  }

  @Get('list/:companyId')
  async listByCompanyId(@Param('companyId', ParseIntPipe) companyId: number) {
    return await this.employeeService.listByCompanyId(companyId);
  }
}

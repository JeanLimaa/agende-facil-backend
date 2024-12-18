import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get(':employeeId/available-times')
  async getAvailableTimes(
    @Param('employeeId') employeeId: number,
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
}

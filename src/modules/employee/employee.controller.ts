import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { GetUser } from 'src/decorators/GetUser.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/list/all')
  async listAll(
    @GetUser("companyId") companyId: number,
  ) {
    return await this.employeeService.listByCompanyId(companyId);
  }

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

  @Get('/:employeeId')
  async getEmployeeById(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return await this.employeeService.getEmployeeById(employeeId);
  }

  @Get('/list/:companyId')
  async listByCompanyId(@Param('companyId', ParseIntPipe) companyId: number) {
    return await this.employeeService.listByCompanyId(companyId);
  }
}

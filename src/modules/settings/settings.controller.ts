import { Body, Controller, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EmployeeService } from '../employee/employee.service';
import { GetUser } from 'src/common/decorators/GetUser.decorator';
import { CreateEmployeeDto } from '../employee/dto/create-employee.dto';
import { CompanyService } from '../company/company.service';
import { UpdateCompanyProfileDto } from '../company/dto/update-company-profile.dto';
import { CreateCompanyAddressDTO } from '../company/dto/create-company-address.dto';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
    constructor(
        private readonly employeeService: EmployeeService,
        private readonly companyService: CompanyService, 
    ) {}

    @Patch('companies/interval-time')
    async updateIntervalTime(
        @GetUser("companyId") companyId: number,
        @Body('interval') interval: number
    ) {
        //return this.employeeService.updateIntervalTime(companyId, interval);
    }
    
    @Put('companies/address')
    async createCompanyAddress(
        @GetUser("companyId") companyId: number,
        @Body() body: CreateCompanyAddressDTO
    ) {
        return this.companyService.createCompanyAddress(companyId, body);
    }

    @Put('/companies/profile')
    async updateCompanyProfile(
        @GetUser("companyId") companyId: number,
        @Body() body: UpdateCompanyProfileDto
    ) {
        return this.companyService.updateCompanyProfile(companyId, body);
    }

    @Put('companies/working-hours')
    async updateCompanyWorkingHours(
        @GetUser("companyId") companyId: number,
        @Body() body: { dayOfWeek: number; startTime: string; endTime: string; isClosed?: boolean }
    ) {
        //return this.companyService.updateCompanyWorkingHours(companyId, body);
    }

    @Put('employee/working-hours')
    async updateEmployeeWorkingHours(
        @GetUser("userId") employeeId: number,
        @Body() body: { dayOfWeek: number; startTime: string; endTime: string; isClosed?: boolean }
    ) {
        //return this.employeeService.updateEmployeeWorkingHours(employeeId, body);
    }
}

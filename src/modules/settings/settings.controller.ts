import { Body, Controller, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EmployeeService } from '../employee/employee.service';
import { GetUser } from 'src/common/decorators/GetUser.decorator';
import { CreateEmployeeDto } from '../employee/dto/create-employee.dto';
import { CompanyService } from '../company/company.service';
import { UpdateCompanyProfileDto } from '../company/dto/update-company-profile.dto';
import { CreateCompanyAddressDTO } from '../company/dto/create-company-address.dto';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/Roles.decorator';
import { UpdateEmployeeDto } from '../employee/dto/update-employee.dto';
import { CompanyWorkingHoursDto } from './dto/company-working-hours.dto';

@Roles(['ADMIN'])
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('settings')
export class SettingsController {
    constructor(
        private readonly employeeService: EmployeeService,
        private readonly companyService: CompanyService, 
    ) {}

    @Post('employee')
    async registerEmployee(
        @GetUser("userId") userId: number,
        @Body() body: CreateEmployeeDto
    ) {
        return this.employeeService.registerEmployee(userId, body);
    }

    @Put('/employee/:employeeId')
    async updateEmployee(
        @GetUser("userId") userId: number, 
        @Param('employeeId', ParseIntPipe) employeeId: number, 
        @Body() body: UpdateEmployeeDto
    ) {
        return this.employeeService.updateEmployee(userId, employeeId, body);
    }

    @Put('/company/profile')
    async updateCompanyProfile(
        @GetUser("companyId") companyId: number,
        @Body() body: UpdateCompanyProfileDto
    ) {
        return this.companyService.updateCompanyProfile(companyId, body);
    }

    @Put('/company/working-hours')
    async updateCompanyWorkingHours(
        @GetUser("companyId") companyId: number,
        @Body("working-hours") body: CompanyWorkingHoursDto
    ) {
        return this.companyService.updateCompanyWorkingHours(companyId, body);
    }
}

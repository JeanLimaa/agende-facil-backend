import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { EmployeeServicesService } from "./employee-services.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/Roles.decorator";
import { RoleGuard } from "src/guards/roles.guard";
import { EmployeeServiceDTO } from "./dto/create-employee-service.dto";

@Controller('employee-services')
export class EmployeeServicesController {
    constructor(
        private readonly employeeServicesService: EmployeeServicesService,
    ) {}

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Post()
    async create(@Body() createEmployeeServiceDto: EmployeeServiceDTO) {
        return await this.employeeServicesService.createMany(createEmployeeServiceDto);
    }

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async delete(@Body() createEmployeeServiceDto: EmployeeServiceDTO) {
        return await this.employeeServicesService.deleteMany(createEmployeeServiceDto);
    }

    @Get('list/:serviceId')
    async listAllEmployeeToService(@Param('serviceId', ParseIntPipe) serviceId: number) {
        return await this.employeeServicesService.listAllEmployeeToService(serviceId);
    }
}
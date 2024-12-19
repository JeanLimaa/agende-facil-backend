import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { EmployeeServicesService } from "./employee-services.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/Roles.decorator";
import { RoleGuard } from "src/guards/roles.guard";

@Controller('employee-services')
export class EmployeeServicesController {
    constructor(
        private readonly employeeServicesService: EmployeeServicesService,
    ) {}

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Post()
    async create(@Body('employeeId') employeeId: number, @Body('serviceId') serviceId: number) {
        return await this.employeeServicesService.create(employeeId, serviceId);
    }

    @Get('list/:serviceId')
    async listAllEmployeeToService(@Param('serviceId', ParseIntPipe) serviceId: number) {
        return await this.employeeServicesService.listAllEmployeeToService(serviceId);
    }
}
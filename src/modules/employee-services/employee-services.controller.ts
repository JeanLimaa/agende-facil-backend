import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { EmployeeServicesService } from "./employee-services.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/common/decorators/Roles.decorator";
import { RoleGuard } from "src/common/guards/roles.guard";
import { EmployeeServicesDTO } from "./dto/create-employee-service.dto";

@Controller('employee-services')
export class EmployeeServicesController {
    constructor(
        private readonly employeeServicesService: EmployeeServicesService,
    ) {}

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Post()
    async create(@Body() createEmployeeCategoryDTO: EmployeeServicesDTO) {
        return await this.employeeServicesService.createMany(createEmployeeCategoryDTO);
    }

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async delete(@Body() createEmployeeCategoryDTO: EmployeeServicesDTO) {
        return await this.employeeServicesService.deleteMany(createEmployeeCategoryDTO);
    }
}
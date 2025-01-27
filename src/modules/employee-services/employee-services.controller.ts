import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { EmployeeServicesService } from "./employee-services.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/decorators/Roles.decorator";
import { RoleGuard } from "src/guards/roles.guard";
import { EmployeeCategoryDTO } from "./dto/create-employee-service.dto";

@Controller('employee-services')
export class EmployeeServicesController {
    constructor(
        private readonly employeeServicesService: EmployeeServicesService,
    ) {}

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Post()
    async create(@Body() createEmployeeCategoryDTO: EmployeeCategoryDTO) {
        return await this.employeeServicesService.createMany(createEmployeeCategoryDTO);
    }

    @Roles([Role.ADMIN])
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async delete(@Body() createEmployeeCategoryDTO: EmployeeCategoryDTO) {
        return await this.employeeServicesService.deleteMany(createEmployeeCategoryDTO);
    }

    @Get('list/:categoryId')
    async listAllEmployeeToCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
        return await this.employeeServicesService.listAllEmployeeToCategory(categoryId);
    }

/*     @Get('list-by-category/:categoryId')
    async listByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
        return await this.employeeServicesService.listByCategory(categoryId);
    } */
}
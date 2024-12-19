import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { EmployeeServicesService } from "./employee-services.service";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";

@Controller('employee-services')
export class EmployeeServicesController {
    constructor(
        private readonly employeeServicesService: EmployeeServicesService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body('employeeId') employeeId: number, @Body('serviceId') serviceId: number) {
        return await this.employeeServicesService.create(employeeId, serviceId);
    }

    @Get('list/:serviceId')
    async listAllEmployeeToService(@Param('serviceId', ParseIntPipe) serviceId: number) {
        return await this.employeeServicesService.listAllEmployeeToService(serviceId);
    }
}
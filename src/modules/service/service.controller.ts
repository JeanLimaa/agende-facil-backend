import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CompanyService } from '../company/company.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateServiceDTO } from './dto/create-service.dto';
import { UpdateServiceDTO } from './dto/update-service.dto';
import { ParseIntPipe } from '@nestjs/common';
import { GetUser } from 'src/decorators/GetUser.decorator';

@Controller('service')
export class ServiceController {
    constructor(
        private readonly serviceService: ServiceService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    public async create(
        @Body() body: CreateServiceDTO,
        @GetUser("companyId") companyId: number,
    ){
        body.companyId = companyId;
        return await this.serviceService.create(body);
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id")
    public async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateServiceDTO,
    ){
        return await this.serviceService.update(id, body);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    public async delete(
        @Param('id', ParseIntPipe) id: number,
    ){
        return await this.serviceService.delete(id);
    }

    @Get("/list/:companyId")
    public async listByCompany(
        @Param('companyId', ParseIntPipe) companyId: number,
    ){
        return await this.serviceService.listByCompanyId(companyId);
    }
}

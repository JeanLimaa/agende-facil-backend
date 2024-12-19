import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { GetUser } from 'src/decorators/GetUser.decorator';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CompanyService } from '../company/company.service';
import { ParseIntPipe } from '@nestjs/common';

@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly company: CompanyService,
    ) {}

    @Get("/list/:companyLinkName")
    public async listByCompany(
        @Param('companyLinkName') companyLinkName: string,
    ){
        return await this.categoryService.listByCompany(companyLinkName);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    public async create(
        @GetUser("userId") userId: number,
        @Body() body: CreateCategoryDTO,
    ){
        const companyId = await this.company.findCompanyIdByUserId(userId);
        return await this.categoryService.create(body.name, companyId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    public async get(
        @Param('id', ParseIntPipe) id: number,
    ){
        return await this.categoryService.getCategoryById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id")
    public async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateCategoryDTO,
    ){
        return await this.categoryService.update(id, body.name);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(":id")
    public async delete(
        @Param('id', ParseIntPipe) id: number,
    ){
        return await this.categoryService.delete(id);
    }
}

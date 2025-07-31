import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { GetUser } from 'src/common/decorators/GetUser.decorator';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ParseIntPipe } from '@nestjs/common';
import { SkipAuth } from 'src/common/decorators/SkipAuth.decorator';


@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) {}

    @SkipAuth()
    @Get("/list/:companyLinkName")
    public async listByCompany(
        @Param('companyLinkName') companyLinkName: string,
    ){
        return await this.categoryService.listByCompany(companyLinkName);
    }

    @Get("/list-all")
    public async listAll(
        @GetUser("companyId") companyId: number,
    ){
        return await this.categoryService.listAllFromCompany(companyId);
    }

    @Post()
    public async create(
        @GetUser("companyId") companyId: number,
        @Body("category-details") body: CreateCategoryDTO,
    ){
        return await this.categoryService.create(body.name, companyId);
    }

    @Get(":id")
    public async get(
        @Param('id', ParseIntPipe) id: number,
    ){
        return await this.categoryService.getCategoryById(id);
    }

    @Put(":id")
    public async update(
        @Param('id', ParseIntPipe) id: number,
        @Body("category-details") body: CreateCategoryDTO,
    ){
        return await this.categoryService.update(id, body.name);
    }

    @Delete(":id")
    public async delete(
        @Param('id', ParseIntPipe) id: number,
        @Body('moveAppointmentsToCategoryId', ParseIntPipe) moveAppointmentsToCategoryId: number
    ){
        return await this.categoryService.delete(id, moveAppointmentsToCategoryId);
    }
}

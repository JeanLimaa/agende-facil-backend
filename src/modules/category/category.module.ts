import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyService } from '../company/company.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, DatabaseService, CompanyService],
  exports: [CategoryService],
})
export class CategoryModule {}

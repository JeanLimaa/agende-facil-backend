import { forwardRef, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [forwardRef(() => CompanyModule)],
  controllers: [CategoryController],
  providers: [CategoryService, DatabaseService],
  exports: [CategoryService],
})
export class CategoryModule {}

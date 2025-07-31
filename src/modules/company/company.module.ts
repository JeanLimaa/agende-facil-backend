import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyController } from './company.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [forwardRef(() => CategoryModule)],
  providers: [CompanyService, DatabaseService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}

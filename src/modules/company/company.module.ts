import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { DatabaseService } from 'src/services/Database.service';

@Module({
  providers: [CompanyService, DatabaseService],
  exports: [CompanyService],
})
export class CompanyModule {}

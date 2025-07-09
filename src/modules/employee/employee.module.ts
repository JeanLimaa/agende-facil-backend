import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    UserModule,
    CompanyModule,
  ],
  controllers: [EmployeeController],
  providers: [DatabaseService, EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}

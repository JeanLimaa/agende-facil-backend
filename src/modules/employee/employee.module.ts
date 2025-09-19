import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeCategoryWorkingHourController } from './employee-category-working-hour.controller';
import { EmployeeCategoryWorkingHourService } from './employee-category-working-hour.service';
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
  controllers: [EmployeeController, EmployeeCategoryWorkingHourController],
  providers: [DatabaseService, EmployeeService, EmployeeCategoryWorkingHourService],
  exports: [EmployeeService, EmployeeCategoryWorkingHourService],
})
export class EmployeeModule {}

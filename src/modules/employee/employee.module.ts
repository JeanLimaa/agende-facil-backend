import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { DatabaseService } from 'src/services/Database.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, DatabaseService],
  exports: [EmployeeService],
})
export class EmployeeModule {}

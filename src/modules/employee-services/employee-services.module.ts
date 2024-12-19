import { Module } from '@nestjs/common';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeServicesService } from './employee-services.service';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeServicesController } from './employee-services.controller';

@Module({
    providers: [EmployeeServicesService, DatabaseService, EmployeeService],
    controllers: [EmployeeServicesController],
    exports: [EmployeeServicesService],
})
export class EmployeeServicesModule {}

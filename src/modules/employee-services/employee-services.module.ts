import { Module } from '@nestjs/common';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeServicesService } from './employee-services.service';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeServicesController } from './employee-services.controller';
import { EmployeeModule } from '../employee/employee.module';

@Module({
    imports: [
        EmployeeModule
    ],
    providers: [EmployeeServicesService, DatabaseService],
    controllers: [EmployeeServicesController],
    exports: [EmployeeServicesService],
})
export class EmployeeServicesModule {}

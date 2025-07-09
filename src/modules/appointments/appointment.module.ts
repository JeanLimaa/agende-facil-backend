import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentScheduler } from './appointment-scheduler.service';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeService } from '../employee/employee.service';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [
    EmployeeModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentScheduler, DatabaseService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

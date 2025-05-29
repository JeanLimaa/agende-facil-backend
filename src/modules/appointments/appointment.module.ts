import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentScheduler } from './appointment-scheduler.service';
import { DatabaseService } from 'src/services/Database.service';
import { EmployeeService } from '../employee/employee.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentScheduler, DatabaseService, EmployeeService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

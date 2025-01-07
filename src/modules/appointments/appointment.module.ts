import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentScheduler } from './appointment-scheduler.service';
import { DatabaseService } from 'src/services/Database.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentScheduler, DatabaseService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

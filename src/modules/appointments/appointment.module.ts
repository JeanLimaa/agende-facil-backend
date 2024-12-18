import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentScheduler } from './appointment-scheduler.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentScheduler],
  exports: [AppointmentService],
})
export class AppointmentModule {}

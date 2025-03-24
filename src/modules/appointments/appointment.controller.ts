import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get("/pending")
  findAll() {
    return this.appointmentService.listPendingAppointments();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findAppointmentById(id);
  }

  @Get('/company/:id')
  findAllByCompany(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findAllByCompany(id);
  }

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto
    );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.deleteAppointment(id);
  }
}

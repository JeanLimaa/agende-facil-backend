import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/GetUser.decorator';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get("/pending")
  findAll() {
    return this.appointmentService.listPendingAppointments();
  }

  @UseGuards(JwtAuthGuard)
  @Patch("complete/:id")
  public async markAsCompleted(
    @Param('id', ParseIntPipe) id: number,
    @GetUser("companyId", ParseIntPipe) companyId: number,
  ) {
    return await this.appointmentService.markAsCompleted(id, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("cancel/:id")
  public async markAsCanceled(
    @Param('id', ParseIntPipe) id: number,
    @GetUser("companyId", ParseIntPipe) companyId: number,
  ) {
    return await this.appointmentService.markAsCanceled(id, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/company')
  findAllByCompany(
    @GetUser("companyId", ParseIntPipe) companyId: number
  ) {
    return this.appointmentService.findAllByCompany(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findAppointmentById(id);
  }

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.deleteAppointment(id);
  }
}

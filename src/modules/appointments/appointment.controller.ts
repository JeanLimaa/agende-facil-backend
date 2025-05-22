import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/GetUser.decorator';
import { SkipAuth } from 'src/decorators/SkipAuth.decorator';

@UseGuards(JwtAuthGuard)
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @SkipAuth()
  @Get("/pending")
  findAll() {
    return this.appointmentService.listPendingAppointments();
  }

  @Patch("complete/:id")
  public async markAsCompleted(
    @Param('id', ParseIntPipe) id: number,
    @GetUser("companyId", ParseIntPipe) companyId: number,
  ) {
    return await this.appointmentService.markAsCompleted(id, companyId);
  }

  @Patch("cancel/:id")
  public async markAsCanceled(
    @Param('id', ParseIntPipe) id: number,
    @GetUser("companyId", ParseIntPipe) companyId: number,
  ) {
    return await this.appointmentService.markAsCanceled(id, companyId);
  }

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

  @SkipAuth()
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

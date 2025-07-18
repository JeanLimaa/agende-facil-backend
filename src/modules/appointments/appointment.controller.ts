import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { BlockAppointmentDto } from './dto/block-appointment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/GetUser.decorator';
import { SkipAuth } from 'src/common/decorators/SkipAuth.decorator';
import { Role } from '@prisma/client';
import { UserPayload } from '../auth/interfaces/UserPayload.interface';
import { DatabaseService } from 'src/services/Database.service';

@UseGuards(JwtAuthGuard)
@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

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

  @Get('/client/:clientId')
  findAllByClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @GetUser("companyId", ParseIntPipe) companyId: number
  ) {
    return this.appointmentService.findAllByClient(clientId, companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.findAppointmentById(id);
  }

  //@SkipAuth()
  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetUser("role") role: Role
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto,
      role,
    );
  }

  @Post('block')
  createBlock(@Body() dto: BlockAppointmentDto) {
    return this.appointmentService.createBlock(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: CreateAppointmentDto,
    @GetUser("role") role: Role,
  ) {
    return this.appointmentService.updateAppointment(id, updateAppointmentDto, role);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.deleteAppointment(id);
  }
}

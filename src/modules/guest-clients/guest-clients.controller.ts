import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GuestClientsService } from './guest-clients.service';
import { CreateGuestClientDto } from './dto/create-guest-client.dto';
import { UpdateGuestClientDto } from './dto/update-guest-client.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('guest-clients')
export class GuestClientsController {
  constructor(private readonly guestClientsService: GuestClientsService) {}

  @Post()
  create(@Body() createGuestClientDto: CreateGuestClientDto) {
    return this.guestClientsService.create(createGuestClientDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.guestClientsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestClientsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuestClientDto: UpdateGuestClientDto) {
    return this.guestClientsService.update(+id, updateGuestClientDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guestClientsService.remove(+id);
  }
}

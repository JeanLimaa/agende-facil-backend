import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/GetUser.decorator';
import { RoleGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/Roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Roles([Role.ADMIN, Role.EMPLOYEE])
  @Get()
  findAll(
    @GetUser('companyId') companyId: number,
  ) {
    console.log('companyId', companyId);
    return this.clientsService.findAll(companyId);
  }
}

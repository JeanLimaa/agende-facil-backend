import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGuestClientDto } from './dto/create-guest-client.dto';
import { UpdateGuestClientDto } from './dto/update-guest-client.dto';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class GuestClientsService {
  constructor(
    private readonly prisma: DatabaseService,
  ) {}

  async create(createGuestClientDto: CreateGuestClientDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: createGuestClientDto.companyId },
    });
    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const existingClient = await this.prisma.guestClient.findFirst({
      where: {
        phone: createGuestClientDto.phone,
        companyId: createGuestClientDto.companyId,
      },
    });

    if (existingClient) {
      return await this.prisma.guestClient.update({
        where: { id: existingClient.id },
        data: {name: createGuestClientDto.name}}
      );
    }

    return await this.prisma.guestClient.create({
      data: {
        name: createGuestClientDto.name,
        phone: createGuestClientDto.phone,
        companyId: createGuestClientDto.companyId,
      },
    });
  }

  findAll() {
    return `This action returns all guestClients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} guestClient`;
  }

  update(id: number, updateGuestClientDto: UpdateGuestClientDto) {
    return `This action updates a #${id} guestClient`;
  }

  remove(id: number) {
    return `This action removes a #${id} guestClient`;
  }
}

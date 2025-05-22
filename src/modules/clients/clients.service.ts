import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { DatabaseService } from 'src/services/Database.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: DatabaseService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: createClientDto.companyId },
    });
    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const existingClient = await this.prisma.client.findFirst({
      where: {
        phone: createClientDto.phone,
        companyId: createClientDto.companyId,
      },
    });

    if (existingClient) {
      return await this.prisma.client.update({
        where: { id: existingClient.id },
        data: {name: createClientDto.name}}
      );
    }

    return await this.prisma.client.create({
      data: {
        name: createClientDto.name,
        phone: createClientDto.phone,
        companyId: createClientDto.companyId,
      },
    });
  }

  async findAll(companyId: number): Promise<Omit<Client, "companyId">[]> {
    return await this.prisma.client.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        companyId: false,
      },
    });
  }
}

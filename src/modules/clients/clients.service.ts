import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { DatabaseService } from 'src/services/Database.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: DatabaseService,
  ) {}

  async create(createClientDto: CreateClientDto, prisma = this.prisma): Promise<Client> {
    const company = await prisma.company.findUnique({
      where: { id: createClientDto.companyId },
    });
    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const existingClient = await prisma.client.findFirst({
      where: {
        phone: createClientDto.phone,
        companyId: createClientDto.companyId,
      },
    });

    if (existingClient) {
      return await prisma.client.update({
        where: { id: existingClient.id },
        data: {name: createClientDto.name}}
      );
    }

    return await prisma.client.create({
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

  public async findOne(id: number, companyId: number): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!client) {
      throw new BadRequestException('Cliente não encontrado');
    }

    return client;
  }

  public async update(id: number, createClientDto: CreateClientDto,){

  }

  public async remove(id: number, companyId: number){

  }
}

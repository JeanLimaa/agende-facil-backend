import { Injectable } from '@nestjs/common';
import { CreateGuestClientDto } from './dto/create-guest-client.dto';
import { UpdateGuestClientDto } from './dto/update-guest-client.dto';

@Injectable()
export class GuestClientsService {
  create(createGuestClientDto: CreateGuestClientDto) {
    return 'This action adds a new guestClient';
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

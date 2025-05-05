import { Module } from '@nestjs/common';
import { GuestClientsService } from './guest-clients.service';
import { GuestClientsController } from './guest-clients.controller';

@Module({
  controllers: [GuestClientsController],
  providers: [GuestClientsService],
})
export class GuestClientsModule {}

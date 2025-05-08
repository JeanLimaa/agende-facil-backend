import { Module } from '@nestjs/common';
import { GuestClientsService } from './guest-clients.service';
import { GuestClientsController } from './guest-clients.controller';
import { DatabaseService } from 'src/services/Database.service';

@Module({
  controllers: [GuestClientsController],
  providers: [GuestClientsService, DatabaseService],
  exports: [GuestClientsService],
})
export class GuestClientsModule {}

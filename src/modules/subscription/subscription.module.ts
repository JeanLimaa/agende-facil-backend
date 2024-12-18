import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyService } from '../company/company.service';

@Module({
  providers: [SubscriptionService, DatabaseService, CompanyService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

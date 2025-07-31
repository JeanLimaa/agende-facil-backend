import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    CompanyModule
  ],
  providers: [SubscriptionService, DatabaseService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

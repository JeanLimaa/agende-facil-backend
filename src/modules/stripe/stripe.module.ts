import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

const stripeFactory = {
    provide: 'STRIPE',
    useFactory: (configService: ConfigService) => {
      return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'));
    },
    inject: [ConfigService],
};

@Module({
  providers: [
    stripeFactory,
    StripeService,
    ConfigService
  ],
  controllers: [StripeController],
  exports: [StripeService]
})
export class StripeModule {}

import { Controller, Get, Post, Body, Query, Req, Res, ResponseDecoratorOptions } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateSessionDTO } from './dto/createSession.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // Endpoint para criar sessão de checkout
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: CreateSessionDTO
  ) {
    const session = await this.stripeService.createCheckoutSession(body.priceId);
    return {url: session.url};
  }

  // Endpoint para cancelar uma assinatura
  @Post('cancel-subscription')
  async cancelSubscription(@Body('subscriptionId') subscriptionId: string) {
    return await this.stripeService.cancelSubscription(subscriptionId);
  }
}

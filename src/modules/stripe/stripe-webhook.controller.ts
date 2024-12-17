import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('webhook')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  @Post()
  async handleWebhook(@Req() request: Request, @Res() response: Response) {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook error: ${err.message}`);
      return response.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }

    // Lidar com os eventos
    switch (event.type) {
      case 'invoice.payment_succeeded':
        console.log('Pagamento aprovado!');
        break;
      case 'customer.subscription.deleted':
        console.log('Assinatura cancelada!');
        break;
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    response.status(HttpStatus.OK).send('Evento recebido com sucesso');
  }
}

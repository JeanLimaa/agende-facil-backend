import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(@Inject('STRIPE') private readonly stripe: Stripe) {}

  // Criar uma sessão de checkout
  async createCheckoutSession(priceId: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
    });

    return session;
  }

  // Cancelar uma assinatura
  async cancelSubscription(subscriptionId: string) {
    const canceledSubscription = await this.stripe.subscriptions.cancel(subscriptionId);
    return canceledSubscription;
  }
}

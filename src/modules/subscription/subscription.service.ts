import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PlanType, Prisma, SubscriptionStatus } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly prisma: DatabaseService,
    ) { }

    async createSubscription(companyId: number, planId: number, transactionPrisma: Prisma.TransactionClient = this.prisma) {
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

        if (!plan || !plan.isActive) {
            throw new Error('Plano inválido ou inativo.');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.duration); // Define a data final

        return transactionPrisma.subscription.create({
            data: {
                companyId,
                planId,
                startDate,
                endDate,
                status: SubscriptionStatus.ACTIVE
            },
        });
    }

    async validateSubscription(companyId: number) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { companyId },
        });

        const plan = await this.prisma.plan.findUnique({
            where: { id: subscription.planId },
        });

        if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
            throw new UnauthorizedException('Assinatura inativa ou expirada.');
        }

        if (plan.name === PlanType.TRIAL && new Date() > subscription.endDate) {
            throw new UnauthorizedException('Período de teste expirado.');
        }

        return subscription;
    }

    async updateSubscriptionToPro(companyId: number) {
        const planPro = await this.prisma.plan.findFirst({
            where: { name: PlanType.PRO, isActive: true },
        });

        if (!planPro) {
            throw new Error('Plano PRO não encontrado ou inativo.');
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + planPro.duration);

        return this.prisma.subscription.updateMany({
            where: { companyId },
            data: {
                planId: planPro.id,
                startDate,
                endDate,
                status: SubscriptionStatus.ACTIVE,
            },
        });
    }
}

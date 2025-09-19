import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PlanType, SubscriptionStatus } from '@prisma/client';
import { TransactionService } from 'src/common/services/transaction-context.service';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(
        private readonly prisma: DatabaseService,
        private readonly transactionService: TransactionService
    ) { }

    async createSubscription(companyId: number, planId: number) {
        try {
            const prisma = this.transactionService.getPrismaInstance();

            this.logger.log('Creating subscription', { companyId, planId });

            const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

            if (!plan || !plan.isActive) {
                this.logger.warn('Invalid or inactive plan', { planId, planExists: !!plan, isActive: plan?.isActive });
                throw new BadRequestException('Plano inválido ou inativo.');
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + plan.duration); // Define a data final

            const subscription = await prisma.subscription.create({
                data: {
                    companyId,
                    planId,
                    startDate,
                    endDate,
                    status: SubscriptionStatus.ACTIVE
                },
            });

            this.logger.log('Subscription created successfully', { 
                subscriptionId: subscription.id, 
                companyId, 
                planId, 
                planName: plan.name,
                startDate, 
                endDate 
            });

            return subscription;
        } catch (error) {
            this.logger.error('Error creating subscription', error.stack, { companyId, planId });
            throw error;
        }
    }

    async validateSubscription(companyId: number) {
        try {
            this.logger.log('Validating subscription', { companyId });

            const subscription = await this.prisma.subscription.findFirst({
                where: { companyId },
            });

            if (!subscription) {
                this.logger.warn('No subscription found for company', { companyId });
                throw new UnauthorizedException('Assinatura não encontrada.');
            }

            const plan = await this.prisma.plan.findUnique({
                where: { id: subscription.planId },
            });

            if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
                this.logger.warn('Inactive or expired subscription', { 
                    companyId, 
                    subscriptionId: subscription?.id, 
                    status: subscription?.status 
                });
                throw new UnauthorizedException('Assinatura inativa ou expirada.');
            }

            if (plan.name === PlanType.TRIAL && new Date() > subscription.endDate) {
                this.logger.warn('Trial period expired', { 
                    companyId, 
                    subscriptionId: subscription.id, 
                    endDate: subscription.endDate 
                });
                throw new UnauthorizedException('Período de teste expirado.');
            }

            this.logger.log('Subscription validated successfully', { 
                companyId, 
                subscriptionId: subscription.id, 
                planName: plan.name, 
                status: subscription.status 
            });

            return subscription;
        } catch (error) {
            this.logger.error('Error validating subscription', error.stack, { companyId });
            throw error;
        }
    }

    async updateSubscriptionToPro(companyId: number) {
        try {
            this.logger.log('Updating subscription to PRO', { companyId });

            const planPro = await this.prisma.plan.findFirst({
                where: { name: PlanType.PRO, isActive: true },
            });

            if (!planPro) {
                this.logger.warn('PRO plan not found or inactive', { companyId });
                throw new BadRequestException('Plano PRO não encontrado ou inativo.');
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + planPro.duration);

            const result = await this.prisma.subscription.updateMany({
                where: { companyId },
                data: {
                    planId: planPro.id,
                    startDate,
                    endDate,
                    status: SubscriptionStatus.ACTIVE,
                },
            });

            this.logger.log('Subscription updated to PRO successfully', { 
                companyId, 
                planId: planPro.id, 
                updatedCount: result.count, 
                startDate, 
                endDate 
            });

            return result;
        } catch (error) {
            this.logger.error('Error updating subscription to PRO', error.stack, { companyId });
            throw error;
        }
    }
}


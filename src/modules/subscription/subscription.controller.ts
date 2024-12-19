import { Controller, Post, UseGuards } from "@nestjs/common";
import { GetUser } from "src/decorators/GetUser.decorator";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { CompanyService } from "../company/company.service";
import { SubscriptionService } from "./subscription.service";

@Controller('subscription')
export class SubscriptionController {
    constructor(
        private readonly companyService: CompanyService,
        private readonly subscriptionService: SubscriptionService
    ) {}
    
    @UseGuards(JwtAuthGuard)
    @Post('subscribe-pro')
    async upgradeToPro(@GetUser('userId') userId: number) {
        const companyId = await this.companyService.findCompanyIdByUserId(userId);
        return this.subscriptionService.updateSubscriptionToPro(companyId);
    }
}
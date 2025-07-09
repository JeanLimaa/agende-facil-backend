import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { GetUser } from "src/common/decorators/GetUser.decorator";
import { SkipAuth } from "src/common/decorators/SkipAuth.decorator";

@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @Get("/info")
    async getCompanyProfile(
        @GetUser('companyId') companyId: number
    ) {
        return this.companyService.getCompanyInfo(companyId);
    }

    @SkipAuth()
    @Get(":name")
    async getCompany(
        @Param('name') name: string
    ) {
        return this.companyService.getCompanyByLinkName(name);
    }
}
import { Controller, Get, Param } from "@nestjs/common";
import { CompanyService } from "./company.service";

@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @Get(":name")
    async getCompany(
        @Param('name') name: string
    ) {
        return this.companyService.getCompanyByName(name);
    }
}
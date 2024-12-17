import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';

@Injectable()
export class CompanyService {
    constructor(
        private readonly prisma: DatabaseService,
    ) {}

    public async createCompany(data: Prisma.CompanyCreateManyInput) {
        const company = await this.prisma.company.create({
            data
        });

        return company;
    }

    public async findCompanyById(id: number) {
        const company = await this.prisma.company.findUnique({
            where: {
                id
            }
        });

        return company;
    }

    public async findCompanyByUserId(userId: number) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }

        return user.companyId;
    }
}

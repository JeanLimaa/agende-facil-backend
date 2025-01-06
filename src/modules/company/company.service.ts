import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';
import slugify from 'slugify';

@Injectable()
export class CompanyService {
    constructor(
        private readonly prisma: DatabaseService,
    ) { }

    private async isLinkExists(link: string): Promise<boolean> {
        const company = await this.prisma.company.findUnique({
            where: { link },
        });

        return !!company;
    }

    private async generateUniqueLink(companyName: string): Promise<string> {
        // 1. Transforma o nome da empresa em "slug"
        let baseLink = slugify(companyName, { lower: true, strict: true });
        
        // 2. Verificar se o link já existe no banco de dados
        // caso o link com o nome nao exista, retorna o link
        const linkExists = await this.isLinkExists(baseLink);
        if (!linkExists) {
            return baseLink;
        }

        // 3. Caso o link já exista, adicionar um contador ao final do link
        let link = baseLink;
        let counter = 1;

        while (await this.isLinkExists(link)) {
            link = `${baseLink}${counter}`;
            counter++;
        }

        return link;
    }

    public async createCompany(
        data: Omit<Prisma.CompanyCreateInput, 'link'>,
        prisma: Prisma.TransactionClient = this.prisma
    ) {
        const link = await this.generateUniqueLink(data.name);

        if (!link) {
            throw new NotFoundException('Link não encontrado');
        }

        const companys = await this.prisma.company.findMany({
            where: {
                email: data.email
            }
        });

        if (companys.length > 0) {
            throw new UnauthorizedException('Empresa com esse e-mail já existe.');
        }

        const company = await prisma.company.create({
            data: {
                ...data,
                link
            }
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

    public async findCompanyIdByUserId(userId: number) {
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

    public async getCompanyByName(name: string) {
        const company = await this.prisma.company.findFirst({
            where: {
                name: name
            }
        });

        if (!company) {
            throw new UnauthorizedException('Empresa não encontrada');
        }

        return company;
    }

    public async getCompanyByLinkName(linkName: string) {
        console.log(linkName);
        const company = await this.prisma.company.findFirst({
            where: {
                link: linkName
            }
        });

        if (!company) {
            throw new NotFoundException('Empresa não encontrada');
        }

        return company;
    }
}
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/services/Database.service';
import slugify from 'slugify';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { CreateCompanyAddressDTO } from './dto/create-company-address.dto';

@Injectable()
export class CompanyService {
    constructor(
        private readonly prisma: DatabaseService,
    ) { }

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

    public async updateIntervalTime(companyId: number, interval: number) {
        const company = await this.prisma.company.update({
            where: {
                id: companyId
            },
            data: {
                intervalBetweenAppointments: interval
            }
        });
        return company;
    }

    public async createCompanyWorkingHours(companyId: number, data: {dayOfWeek: string, startTime: string, endTime: string}[]) {
        return await this.prisma.companyWorkingHour.createMany({
            data: Array.from({ length: 7 }, (_, dayOfWeek) => ({
                companyId,
                isClosed: false,
                dayOfWeek,
                startTime: data[dayOfWeek].startTime,
                endTime: data[dayOfWeek].endTime
            })),
        });
    }

    public async updateCompanyWorkingHours(
        companyId: number,
        data: { dayOfWeek: number; startTime: string; endTime: string; isClosed?: boolean }[]
    ) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            throw new NotFoundException('Empresa não encontrada');
        }

        const updatedWorkingHours = data.map(hour => ({
            where: {
                companyId_dayOfWeek: {
                    companyId,
                    dayOfWeek: hour.dayOfWeek
                }
            },
            data: {
                startTime: hour.startTime,
                endTime: hour.endTime,
                isClosed: hour.isClosed ?? false
            }
        }));

        return await this.prisma.companyWorkingHour.updateMany({
            data: updatedWorkingHours
        });
    }

    public async updateCompanyProfile(companyId: number, data: UpdateCompanyProfileDto) {
        const company = await this.prisma.company.update({
            where: {
                id: companyId
            },
            data: {
                name: data.profile.name,
                phone: data.profile.phone,
                email: data.profile.email,
                description: data?.profile.description,
            },
        });

        await this.createOrUpdateCompanyAddress(companyId, data.address);

        return company;
    }

    private async createOrUpdateCompanyAddress(companyId: number, data: CreateCompanyAddressDTO){
        const company = await this.prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            throw new NotFoundException('Empresa não encontrada');
        }

        const companyAddress = await this.prisma.companyAddress.findFirst({
            where: { companyId }
        });

        if (companyAddress) {
            return this.prisma.companyAddress.update({
                where: { companyId },
                data: {
                    zipCode: data.zipCode,
                    street: data.street,
                    number: data.number,
                    neighborhood: data.neighborhood,
                    city: data.city,
                    state: data.state,
                    country: data.country
                }
            });
        } else {
            return this.prisma.companyAddress.create({
                data: {
                    companyId,
                    zipCode: data.zipCode,
                    street: data.street,
                    number: data.number,
                    neighborhood: data.neighborhood,
                    city: data.city,
                    state: data.state,
                    country: data.country
                }
            });
        }
    }

    public async getCompanyInfo(companyId: number) {
        const company = await this.prisma.company.findUniqueOrThrow({
            where: { id: companyId}
        });

        const companyData = {
            name: company.name,
            email: company.email,
            phone: company.phone,
            description: company.description,
        }

        const companyAddress = await this.prisma.companyAddress.findFirst({
            where: { companyId }
        });

        const companyAddressData = {
            zipCode: companyAddress?.zipCode || '',
            street: companyAddress?.street || '',
            number: companyAddress?.number || '',
            neighborhood: companyAddress?.neighborhood || '',
            city: companyAddress?.city || '',
            state: companyAddress?.state || '',
            country: companyAddress?.country || ''
        }

        return {
            profile: companyData,
            address: companyAddress ? companyAddressData : null,
            schedule: {
                workingHours: await this.getCompanyWorkingHours(companyId), 
                serviceInterval: company.intervalBetweenAppointments
            }
        };
    }

    private async getCompanyWorkingHours(companyId: number) {
        const workingHours = await this.prisma.companyWorkingHour.findMany({
            where: { companyId },
            orderBy: { dayOfWeek: 'asc' }
        });

        return workingHours.map(hour => ({
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime
        }));
    }

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
}
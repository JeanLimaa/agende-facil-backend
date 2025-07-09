import { BadRequestException, Injectable } from "@nestjs/common";
import { Employee, Prisma, PrismaClient, Role, User } from "@prisma/client";
import { DatabaseService } from "src/services/Database.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: DatabaseService
    ) { }

    async create(data: Prisma.UserCreateManyInput, prisma: Prisma.TransactionClient = this.prisma): Promise<User> {
        const usersExists = await prisma.user.findMany({
            where: {
                email: data.email
            }
        });

        if (usersExists.length > 0) {
            throw new BadRequestException('Usuario com esse e-mail já existe.');
        }

        return await prisma.user.create({
            data
        });
    }

    async update(id: number, data: Prisma.UserUncheckedUpdateManyInput): Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async findByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    async findById(id: number) {
        return await this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    public async isUserAdmin(userId: number) {
        const admin = await this.findById(userId);

        if (!admin || admin.role !== Role.ADMIN) {
            return false;
        }

        return true;
    }
}
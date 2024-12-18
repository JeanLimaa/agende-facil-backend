import { Injectable } from "@nestjs/common";
import { Employee, Prisma, User } from "@prisma/client";
import { DatabaseService } from "src/services/Database.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: DatabaseService
    ){}

    async create(data: Prisma.UserCreateManyInput): Promise<User> {
        return await this.prisma.user.create({
            data
        });
    }

    async update(id: number, data: Prisma.UserUncheckedUpdateManyInput): Promise<User> {
        return await this.prisma.user.update({
            where: { id },
            data,
        });
    }

    public async createEmployee(data: Prisma.EmployeeCreateManyInput){
        return await this.prisma.employee.create({
            data
        });
    }

    async findByEmail(email: string){
        return await this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    async findById(id: number){
        return await this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }
}
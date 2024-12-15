import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/services/Database.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: DatabaseService
    ){}

    async create(data: any){
        return await this.prisma.user.create({
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
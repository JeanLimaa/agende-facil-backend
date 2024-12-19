import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { UpdateServiceDTO } from "./update-service.dto";

export class CreateServiceDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    duration: number;

    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    companyId: number; // É obtido no controller através do decorator GetUser
}
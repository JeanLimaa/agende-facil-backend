import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

class ServiceDetails {
    @IsNotEmpty({message: "O nome é obrigatório"})
    @IsString()
    name: string;

    @IsOptional()
    description: string;

    @IsNotEmpty({message: "A duração é obrigatória"})
    @IsNumber()
    duration: number;

    @IsNotEmpty({message: "A categoria é obrigatória"})
    @IsNumber()
    categoryId: number;
}

class ServicePricing {
    @IsNotEmpty({message: "O preço é obrigatório"})
    @IsNumber({},{message: "O preço deve ser um número"})
    price: number;
}

export class CreateServiceDTO {
    @IsNotEmpty({message: "Os detalhes do serviço são obrigatórios"})
    @ValidateNested()
    @Type(() => ServiceDetails)
    details: ServiceDetails;

    @IsNotEmpty({message: "Os preços do serviço são obrigatórios"})
    @ValidateNested()
    @Type(() => ServicePricing)
    pricing: ServicePricing;
}
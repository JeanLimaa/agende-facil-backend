import {  IsNumber, IsString, ValidateIf } from "class-validator";

export class UpdateServiceDTO {
    @ValidateIf((o) => o.name !== undefined)
    @IsString()
    name?: string;

    @ValidateIf((o) => o.description !== undefined)
    @IsString()
    description?: string;

    @ValidateIf((o) => o.price !== undefined)
    @IsNumber()
    price?: number;

    @ValidateIf((o) => o.duration !== undefined)
    @IsNumber()
    duration?: number;
}
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCategoryDTO {
    @IsNotEmpty()
    @IsString()
    name: string;
}
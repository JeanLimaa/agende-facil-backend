import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCategoryDTO {
    @IsNotEmpty({ message: "O nome não pode estar vazio" })
    @IsString({ message: "O nome não pode estar vazio" })
    name: string;
}
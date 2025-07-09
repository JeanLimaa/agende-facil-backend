import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";

export class UpdateCompanyProfileDto {
    @IsString({
        message: "O nome da empresa é obrigatório.",
    })
    name: string;

    @IsPhoneNumber("BR", {
        message: "O telefone deve ser um número de telefone válido.",
    })
    phone: string;

    @IsEmail({}, {
        message: "O e-mail deve ser um endereço de e-mail válido.",
    })
    email: string;

    @IsOptional()
    @IsString({
        message: "A descrição deve ser uma string.",
    })
    @Length(0, 500, {
        message: "A descrição não pode exceder 500 caracteres.",
    })
    description?: string;
}
import { IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateEmployeeDto {
    @IsString({ message: 'O nome deve ser uma string' })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
    name: string;

    @IsOptional()
    @IsBoolean({ message: 'O campo deve ser um booleano' })
    displayOnline: boolean = false;

    @IsOptional()
    @IsPhoneNumber('BR', { message: 'O telefone deve ser um número de telefone válido' })
    phone: string;

    @IsOptional()
    @IsString({ message: 'A imagem profissional deve ser uma string' })
    profileImageUrl: string;

    @IsOptional()
    @IsString({ message: 'A posição deve ser uma string' })
    position: string;
}
import { IsEmail, IsString, IsPhoneNumber, Min, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password: string;

    @IsPhoneNumber('BR')
    phone: string;
}

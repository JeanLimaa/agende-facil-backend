import { IsBoolean, IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from '../../auth/dto/create-user.dto';

export class CreateEmployeeDto {
    @IsString({ message: 'O nome deve ser uma string' })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
    name: string;

    @IsBoolean({message: 'O campo deve ser um booleano'})
    shouldDisplayOnline: boolean;

    @IsOptional()
    @IsEmail({}, { message: 'O email deve ser um email válido' })
    email: string;

    @IsOptional()
    @IsPhoneNumber('BR', { message: 'O telefone deve ser um número de telefone válido' })
    phone: string;

    @IsOptional()
    @IsString({ message: 'A imagem profissional deve ser uma string' })
    professionalImage: string;
}
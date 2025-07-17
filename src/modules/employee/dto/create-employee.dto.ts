import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from 'class-validator';

class EmployeeProfile {
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

class EmployeeWorkingHours {
    @IsString({ message: 'O horário de início deve ser uma string no formato HH:mm' })
    startTime: string;

    @IsString({ message: 'O horário de término deve ser uma string no formato HH:mm' })
    endTime: string;

    @IsBoolean({ message: 'O campo isClosed deve ser um booleano' })
    isClosed: boolean = false;
}

export class CreateEmployeeDto {
  @ValidateNested()
  @Type(() => EmployeeProfile)
  profile: EmployeeProfile;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmployeeWorkingHours)
  workingHours?: EmployeeWorkingHours[];
}
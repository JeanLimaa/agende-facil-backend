import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsPhoneNumber, IsString, Matches, MinLength, ValidateNested } from 'class-validator';

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
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'O horário de início deve estar no formato HH:mm',
  })
  startTime: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'O horário de término deve estar no formato HH:mm',
  })
  endTime: string;

  @IsNumber({}, { message: 'O campo dayOfWeek deve ser um número (0-6)' })
  dayOfWeek: number;
}

class EmployeeServices {
  @IsNumber({}, { message: 'O campo serviceId deve ser um número' })
  serviceId: number;
}

class WorkingHoursWrapper {
  @IsNumber({}, { message: 'O campo serviceInterval deve ser um número' })
  @IsOptional()
  serviceInterval: number;

  @ValidateNested({ each: true })
  @Type(() => EmployeeWorkingHours)
  @IsOptional()
  workingHours: EmployeeWorkingHours[];
}

export class CreateEmployeeDto {
  @ValidateNested()
  @Type(() => EmployeeProfile)
  profile: EmployeeProfile;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursWrapper)
  workingHours?: WorkingHoursWrapper;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmployeeServices)
  employeeServices?: EmployeeServices[];
}

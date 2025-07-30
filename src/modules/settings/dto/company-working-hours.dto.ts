import { Type } from "class-transformer";
import { IsInt, IsNumber, IsString, ValidateNested } from "class-validator";

export class DailyWorkingHoursDto {
    @IsInt({message: "O dia da semana deve ser um número inteiro entre 0 (Domingo) e 6 (Sábado)."})
    dayOfWeek: number;

    @IsString({message: "O horário de início deve ser uma string."})
    startTime: string;

    @IsString({message: "O horário de término deve ser uma string."})
    endTime: string;
}

export class CompanyWorkingHoursDto {
    @IsNumber({}, {message: "O intervalo de tempo entre os atendimentos deve ser um número inteiro."})
    serviceInterval: number; // em minutos

    @ValidateNested({ each: true, message: "Horários de funcionamento inválidos." })
    @Type(() => DailyWorkingHoursDto)
    workingHours: DailyWorkingHoursDto[];
}
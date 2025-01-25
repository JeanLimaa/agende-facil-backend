import { IsString, IsNotEmpty, IsNumber, IsDateString, IsArray } from 'class-validator';

export class CreateAppointmentDto {
    //@IsNotEmpty()
    @IsDateString()
    date: string;

    @IsString({message: "Hora precisa ser uma string. Ex: 08:00"})
    hours: string;

    clientId?: number;

    guestClientId?: number;

    //@IsNumber()
    @IsNotEmpty({message: "ID do empregado não informado."})
    employeeId: number;
    
    //@IsNumber()
    @IsNotEmpty({message: "ID do serviço não informado."})
    @IsArray({message: "Os ID's do serviço precisam estar contidos em um array."})
    serviceId: number[];
}
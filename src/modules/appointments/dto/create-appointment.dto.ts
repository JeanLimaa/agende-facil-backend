import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

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
    serviceId: number;
}
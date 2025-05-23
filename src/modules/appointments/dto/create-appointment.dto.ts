import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsArray, IsOptional } from 'class-validator';
import { IsDateTime } from 'src/common/decorators/ClassValidator.decorator';

export class CreateAppointmentDto {
    //@IsNotEmpty()
    @IsDateTime({message: "Data do agendamento inválida. Precisa ser DateTime."})
    date: string;

    @IsNumber()
    @IsNotEmpty({message: "Cliente não informado."})
    clientId: number;

    @IsNumber({}, {message: "Valor de desconto inválido. Precisa ser um número."})
    discount: number;

    //@IsNumber()
    @IsNotEmpty({message: "Empregado não informado."})
    employeeId: number;
    
    //@IsNumber()
    @IsNotEmpty({message: "ID do serviço não informado."})
    @IsArray({message: "Os ID's do serviço precisam estar contidos em um array."})
    serviceId: number[];
}
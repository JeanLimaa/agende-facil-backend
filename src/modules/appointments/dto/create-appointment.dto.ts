import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAppointmentDto {
    date: Date;

    clientId?: number;

    guestClientId?: number;

    employeeId: number;
    
    serviceId: number;
}
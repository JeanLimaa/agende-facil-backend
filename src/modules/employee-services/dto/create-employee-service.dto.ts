import { IsInt, IsArray, ArrayNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeServiceDTO {
    @IsInt()
    employeeId: number;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => EmployeeServicePair)
    services: EmployeeServicePair[];
}

export class EmployeeServicePair {
    @IsInt()
    serviceId: number;
}
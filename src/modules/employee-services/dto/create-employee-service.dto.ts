import { IsInt, IsArray, ArrayNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeServicesDTO {
    @IsInt()
    employeeId: number;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => EmployeeServicesPair)
    services: EmployeeServicesPair[];
}

export class EmployeeServicesPair {
    @IsInt()
    serviceId: number;
} 
import { IsInt, IsArray, ArrayNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeCategoryDTO {
    @IsInt()
    employeeId: number;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => EmployeeCategorysPair)
    categorys: EmployeeCategorysPair[];
}

export class EmployeeCategorysPair {
    @IsInt()
    categoryId: number;
} 
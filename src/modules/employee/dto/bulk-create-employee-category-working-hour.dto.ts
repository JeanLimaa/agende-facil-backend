import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEmployeeCategoryWorkingHourDto } from './create-employee-category-working-hour.dto';

export class BulkCreateEmployeeCategoryWorkingHourDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeCategoryWorkingHourDto)
  workingHours: CreateEmployeeCategoryWorkingHourDto[];
}
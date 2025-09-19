import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeCategoryWorkingHourDto } from './create-employee-category-working-hour.dto';

export class UpdateEmployeeCategoryWorkingHourDto extends PartialType(CreateEmployeeCategoryWorkingHourDto) {}
import { IsInt, IsString, Min, Max, Matches } from 'class-validator';

export class CreateEmployeeCategoryWorkingHourDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime deve estar no formato HH:mm (ex: 09:00)'
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime deve estar no formato HH:mm (ex: 18:00)'
  })
  endTime: string;

  @IsInt()
  employeeId: number;

  @IsInt()
  categoryId: number;
}
import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class CreateEmployeeDto extends OmitType(CreateUserDto, ['role'] as const) {}
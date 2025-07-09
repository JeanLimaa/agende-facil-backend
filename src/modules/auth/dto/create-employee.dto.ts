import { CreateUserDto } from './create-user.dto';

export class CreateEmployeeDto extends CreateUserDto {} //OmitType(CreateUserDto, ['role'] as const) {}
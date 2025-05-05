import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestClientDto } from './create-guest-client.dto';

export class UpdateGuestClientDto extends PartialType(CreateGuestClientDto) {}

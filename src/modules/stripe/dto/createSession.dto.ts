import { IsString } from 'class-validator';

export class CreateSessionDTO {
    @IsString()
    priceId: string;
}
import { BadRequestException } from "@nestjs/common";

export function parseTimeToMinutes(time: string | null): number {
    if (!time) throw new BadRequestException('Horário inválido');
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
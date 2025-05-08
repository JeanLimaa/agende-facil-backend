import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";


export class CreateGuestClientDto {
    @IsPhoneNumber("BR", { message: "Número de telefone inválido" })
    phone: string;

    @IsString({ message: "Nome inválido" })
    name: string;

    @IsNotEmpty({ message: "Empresa não informada." })
    companyId: number;
}

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Cria uma empresa inicial
    const company = await prisma.company.create({
        data: {
            name: 'Empresa Inicial',
            email: 'company@dev.com',
            phone: '1234567890',
            link: 'dev',
            address: "Rua da Empresa, 123",
        },
    });

    // Cria um empregado inicial associado à empresa
    const employee = await prisma.employee.create({
        data: {
            name: 'Empregado Inicial',
            phone: '71984043767',
            companyId: company.id,
            position: 'Desenvolvedor',
        },
    });

    // Cria um usuário inicial associado à empresa
    const user = await prisma.user.create({
        data: {
            email: 'user@dev.com',
            password: await bcrypt.hash('12345678', 10),
            companyId: company.id,
            role: 'ADMIN',
            employeeId: employee.id,
        },
    });

    // Cria categorias iniciais
    const category1 = await prisma.category.create({
        data: {
            name: 'Categoria 1',
            description: 'Descrição da Categoria 1',
            companyId: company.id,
        },
    });

    const category2 = await prisma.category.create({
        data: {
            name: 'Categoria 2',
            description: 'Descrição da Categoria 2',
            companyId: company.id
        },
    });

    // Cria serviços iniciais associados às categorias
    const service1 = await prisma.service.create({
        data: {
            name: 'Serviço 1',
            description: 'Descrição do Serviço 1',
            price: 100.0,
            duration: 60,
            categoryId: category1.id,
            companyId: company.id,
        },
    });

    const service2 = await prisma.service.create({
        data: {
            name: 'Serviço 2',
            description: 'Descrição do Serviço 2',
            price: 200.0,
            duration: 120,
            categoryId: category2.id,
            companyId: company.id,
        },
    });

    const employeeCategorys1 = await prisma.employeeCategorys.create({
        data: {
            employeeId: employee.id,
            categoryId: category1.id,
        },
    });

    const employeeCategorys2 = await prisma.employeeCategorys.create({
        data: {
            employeeId: employee.id,
            categoryId: category2.id,
        },
    });

    // Cria um cliente convidado inicial associado à empresa
    const client = await prisma.client.create({
        data: {
            name: 'Cliente Convidado Inicial',
            phone: '71984043767',
            companyId: company.id,
        },
    });

    // Cria um agendamento inicial associado ao cliente convidado e ao empregado
    const appointments = await prisma.appointment.createMany({
        data: [
            {
                date: new Date(),
                status: 'PENDING',
                employeeId: employee.id,
                clientId: client.id,
                totalDuration: 60,
                totalPrice: 100.0,
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() - 1)),
                status: 'CONFIRMED',
                employeeId: employee.id,
                clientId: client.id,
                totalDuration: 120,
                totalPrice: 200.0,
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() - 2)),
                status: 'CANCELLED',
                employeeId: employee.id,
                clientId: client.id,
                totalDuration: 90,
                totalPrice: 150.0,
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() - 3)),
                status: 'COMPLETED',
                employeeId: employee.id,
                clientId: client.id,
                totalDuration: 30,
                totalPrice: 50.0,
            },
            {
                date: new Date(new Date().setDate(new Date().getDate() - 4)),
                status: 'PENDING',
                employeeId: employee.id,
                clientId: client.id,
                totalDuration: 45,
                totalPrice: 75.0,
            },
        ],
    });

    // Recupera os IDs dos agendamentos criados
    const createdAppointments = await prisma.appointment.findMany({
        where: {
            employeeId: employee.id,
            clientId: client.id,
        },
    });

    // Associa os serviços aos agendamentos
    for (const appointment of createdAppointments) {
        await prisma.appointmentService.createMany({
            data: [
                {
                    appointmentId: appointment.id,
                    serviceId: service1.id,
                },
                {
                    appointmentId: appointment.id,
                    serviceId: service2.id,
                },
            ],
        });
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        console.log('Seed de dados inicial executado com sucesso!');
        await prisma.$disconnect();
    });
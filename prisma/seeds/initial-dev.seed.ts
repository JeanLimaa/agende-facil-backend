import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Cria uma empresa inicial
    const company = await prisma.company.create({
        data: {
            name: 'Empresa Inicial',
            email: 'contato@empresa.com',
            phone: '1234567890',
            link: 'empresa-inicial',
            address: "Rua da Empresa, 123",
        },
    });

    // Cria um empregado inicial associado à empresa
    const employee = await prisma.employee.create({
        data: {
            name: 'Empregado Inicial',
            phone: '0987654321',
            companyId: company.id,
            position: 'Desenvolvedor',
        },
    });

        // Cria um usuário inicial associado à empresa
        const user = await prisma.user.create({
            data: {
                email: 'usuario@empresa.com',
                password: 'senhaSegura123', // Certifique-se de usar um hash de senha em produção
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
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: 'TRIAL',
        description: 'Plano de teste gratuito',
        price: 0,
        duration: 7,
        isActive: true,
      },
      {
        name: 'PRO',
        description: 'Plano profissional com recursos avançados',
        price: 19.99,
        duration: 30,
        isActive: true,
      },
    ],
  });
}

main()
  .then(() => console.log('Planos inseridos com sucesso!'))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

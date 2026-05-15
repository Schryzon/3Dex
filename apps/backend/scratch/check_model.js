
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = '63d55dda-3ebc-40d3-b6f4-a095ab048bc4';
  const model = await prisma.model.findUnique({
    where: { id },
    include: {
        category: true,
        tags: true,
        artist: true
    }
  });
  console.log('Model:', JSON.stringify(model, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

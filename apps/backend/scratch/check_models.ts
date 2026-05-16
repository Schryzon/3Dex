
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const models = await prisma.model.findMany({
    take: 5,
    include: {
      artist: { select: { username: true } },
      category: true
    }
  });
  console.log(JSON.stringify(models, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

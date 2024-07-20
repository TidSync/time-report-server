import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const items = [];

  for (let i = 0; i < 4; i++) {
    const response = await fetch('https://fakestoreapi.com/products');
    const result = await response.json();

    items.push(...result);

    // await prisma.product.createMany({
    //   data: result.map((item: any) => ({
    //     name: item.title,
    //     description: item.description,
    //     price: item.price,
    //     tags: item.category,
    //   })),
    // });
  }

  console.log(items);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

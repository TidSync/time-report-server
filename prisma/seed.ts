import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// const SUBSCRIPTION_PRICING = [
//   { price_in_cents: 1000, name: 'Basic Package', user_limit: 10 },
//   { price_in_cents: 2000, name: 'Advanced Package', user_limit: 50 },
//   { price_in_cents: 3000, name: 'Expert Package', user_limit: Infinity },
// ];

async function main() {
  // return Promise.all(
  //   SUBSCRIPTION_PRICING.map(async (subscription) => {
  //     await prisma.subscription.create({ data: subscription });
  //   }),
  // );
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

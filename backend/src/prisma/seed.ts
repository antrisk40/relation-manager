import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      username: 'alice',
      age: 25,
      hobbies: ['reading', 'coding', 'gaming'],
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'bob',
      age: 30,
      hobbies: ['coding', 'music', 'travel'],
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'charlie',
      age: 28,
      hobbies: ['gaming', 'reading', 'sports'],
    },
  });

  const user4 = await prisma.user.create({
    data: {
      username: 'diana',
      age: 27,
      hobbies: ['music', 'travel', 'photography'],
    },
  });

  // Create friendships
  await prisma.friendship.create({
    data: {
      userId: user1.id,
      friendId: user2.id,
    },
  });

  await prisma.friendship.create({
    data: {
      userId: user1.id,
      friendId: user3.id,
    },
  });

  await prisma.friendship.create({
    data: {
      userId: user2.id,
      friendId: user4.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Created users:', { user1, user2, user3, user4 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


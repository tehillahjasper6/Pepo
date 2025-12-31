import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pepo.app' },
    update: {},
    create: {
      email: 'admin@pepo.app',
      passwordHash: adminPassword,
      name: 'PEPO Admin',
      role: 'ADMIN',
      emailVerified: true,
      city: 'New York',
      gender: 'PREFER_NOT_TO_SAY',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        passwordHash: password,
        name: `Test User ${i}`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i - 1],
        gender: ['MALE', 'FEMALE', 'OTHER', 'MALE', 'FEMALE'][i - 1] as any,
        emailVerified: true,
      },
    });
    users.push(user);
  }
  console.log('✅ Test users created:', users.length);

  // Create test giveaways
  const giveaway1 = await prisma.giveaway.create({
    data: {
      userId: users[0].id,
      title: 'Vintage Bookshelf',
      description: 'Beautiful wooden bookshelf, gently used. Perfect for your home library!',
      images: [
        'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
      ],
      category: 'Furniture',
      location: 'New York, NY',
      eligibilityGender: 'ALL',
      quantity: 1,
      status: 'OPEN',
      publishedAt: new Date(),
    },
  });

  const giveaway2 = await prisma.giveaway.create({
    data: {
      userId: users[1].id,
      title: 'Kids Toys Bundle',
      description: 'Collection of gently used toys suitable for ages 3-7. Includes puzzles, blocks, and more.',
      images: [
        'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800',
      ],
      category: 'Toys',
      location: 'Los Angeles, CA',
      eligibilityGender: 'ALL',
      quantity: 1,
      status: 'OPEN',
      publishedAt: new Date(),
    },
  });

  const giveaway3 = await prisma.giveaway.create({
    data: {
      userId: users[2].id,
      title: 'Winter Coat - Women\'s',
      description: 'Warm winter coat, size M. Great condition, just doesn\'t fit anymore.',
      images: [
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      ],
      category: 'Clothing',
      location: 'Chicago, IL',
      eligibilityGender: 'FEMALE',
      quantity: 1,
      status: 'OPEN',
      publishedAt: new Date(),
    },
  });

  console.log('✅ Test giveaways created:', 3);

  // Create some participations
  await prisma.participant.create({
    data: {
      userId: users[3].id,
      giveawayId: giveaway1.id,
      status: 'INTERESTED',
    },
  });

  await prisma.participant.create({
    data: {
      userId: users[4].id,
      giveawayId: giveaway1.id,
      status: 'INTERESTED',
    },
  });

  await prisma.participant.create({
    data: {
      userId: users[1].id,
      giveawayId: giveaway3.id,
      status: 'INTERESTED',
    },
  });

  console.log('✅ Test participations created');

  // Create test NGO
  const ngoUser = await prisma.user.upsert({
    where: { email: 'ngo@foodbank.org' },
    update: {},
    create: {
      email: 'ngo@foodbank.org',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Community Food Bank',
      role: 'NGO',
      emailVerified: true,
      city: 'Phoenix',
      gender: 'PREFER_NOT_TO_SAY',
    },
  });

  const ngoProfile = await prisma.nGOProfile.upsert({
    where: { userId: ngoUser.id },
    update: {},
    create: {
      userId: ngoUser.id,
      organizationName: 'Community Food Bank',
      registrationNumber: 'NGO-2024-001',
      description: 'Providing food assistance to families in need since 2010.',
      status: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: admin.id,
    },
  });

  console.log('✅ Test NGO created:', ngoProfile.organizationName);

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@pepo.app / admin123');
  console.log('User: user1@example.com / password123');
  console.log('NGO: ngo@foodbank.org / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


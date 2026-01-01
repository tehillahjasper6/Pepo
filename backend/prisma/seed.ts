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
      organizationType: 'NGO',
      country: 'Kenya',
      city: 'Nairobi',
      address: '123 Main St',
      contactName: 'John Doe',
      contactRole: 'Director',
      contactEmail: 'john@foodbank.org',
      contactPhone: '+254700000000',
      officialEmail: 'ngo@foodbank.org',
      officialPhone: '+254700000000',
      status: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: admin.id,
    },
  });

  console.log('✅ Test NGO created:', ngoProfile.organizationName);

  // Badge definitions with refined criteria
  const badges = [
    {
      code: 'FIRST_GIVER',
      name: 'First Giver',
      description: 'Thank you for your first successful give! 🎉 Items shared: 1+',
      criteria: { threshold: 1, metric: 'successful_gives', description: '1+ successful giveaways completed' },
      icon: 'gift-open',
      color: '#60A5FA',
      isNGO: false,
    },
    {
      code: 'VERIFIED_GIVER',
      name: 'Verified Giver',
      description: 'Email or phone verified + successful give awarded.',
      criteria: { requirement: 'verified_and_successful_give', minGives: 1, description: 'Account verified and at least 1 successful give' },
      icon: 'shield-check',
      color: '#34D399',
      isNGO: false,
    },
    {
      code: 'CONSISTENT_GIVER',
      name: 'Consistent Giver',
      description: 'Sustained local giving. Items shared: 10+',
      criteria: { threshold: 10, metric: 'successful_gives', description: '10+ successful giveaways over time' },
      icon: 'repeat',
      color: '#FBBF24',
      isNGO: false,
    },
    {
      code: 'COMMUNITY_GIVER',
      name: 'Community Giver',
      description: 'Part of organized community giving drives.',
      criteria: { metric: 'community_drive_count', threshold: 1, description: 'Participated in 1+ community-organized campaigns' },
      icon: 'users',
      color: '#A78BFA',
      isNGO: false,
    },
    {
      code: 'IMPACT_GIVER',
      name: 'Impact Giver',
      description: 'Shared essential items (food, clothing, books, medical).',
      criteria: { metric: 'impact_items_shared', threshold: 1, categories: ['food', 'clothing', 'books', 'medical'], description: 'Shared high-impact essentials' },
      icon: 'heart',
      color: '#EF4444',
      isNGO: false,
    },
    {
      code: 'VERIFIED_NGO',
      name: 'Verified NGO',
      description: 'Officially verified by PEPO admin review process.',
      criteria: { requirement: 'ngo_verified', description: 'Passed verification by PEPO admin team' },
      icon: 'badge',
      color: '#10B981',
      isNGO: true,
    },
    {
      code: 'TRANSPARENT_NGO',
      name: 'Transparent NGO',
      description: 'Submitted 2+ transparency reports (quarterly or annual).',
      criteria: { metric: 'transparency_reports', threshold: 2, description: '2+ approved transparency reports submitted' },
      icon: 'document-text',
      color: '#60A5FA',
      isNGO: true,
    },
    {
      code: 'PARTNER_NGO',
      name: 'Partner NGO',
      description: 'Official PEPO partner with formal agreement.',
      criteria: { requirement: 'partner_agreement', description: 'Signed partnership agreement with PEPO' },
      icon: 'handshake',
      color: '#F97316',
      isNGO: true,
    },
    {
      code: 'SEASONAL_GIVER',
      name: 'Seasonal Giver',
      description: 'Active in holiday & seasonal giving campaigns.',
      criteria: { metric: 'seasonal_campaigns', threshold: 1, description: 'Participated in 1+ seasonal giving drives (Holidays, Relief, etc)' },
      icon: 'sun',
      color: '#7C3AED',
      isNGO: false,
    },
    {
      code: 'COMMUNITY_HERO',
      name: 'Community Hero',
      description: 'Exceptional local impact: 25+ gives or trusted community member.',
      criteria: { threshold: 25, metric: 'successful_gives', description: '25+ successful giveaways or recognized community leader (admin-awarded)' },
      icon: 'sparkles',
      color: '#0EA5E9',
      isNGO: false,
    },
  ];

  for (const b of badges) {
    await prisma.badgeDefinition.upsert({
      where: { code: b.code },
      update: {
        name: b.name,
        description: b.description,
        criteria: b.criteria as any,
        icon: b.icon,
        color: b.color,
        isNGO: b.isNGO,
      },
      create: {
        code: b.code,
        name: b.name,
        description: b.description,
        criteria: b.criteria as any,
        icon: b.icon,
        color: b.color,
        isNGO: b.isNGO,
      },
    });
  }

  console.log('✅ Badge definitions seeded');

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


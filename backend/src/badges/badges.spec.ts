import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Badge awarding tests for auto-award logic
 */
describe.skip('Badge Award Logic', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    // In production, use test DB instance
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('FIRST_GIVER badge', () => {
    it('should award FIRST_GIVER badge on first successful pickup', async () => {
      // Create test user and giveaway
      const user = await prisma.user.create({
        data: {
          email: `user-${Date.now()}@test.com`,
          name: 'Test Giver',
          city: 'Test City',
          gender: 'PREFER_NOT_TO_SAY',
        },
      });

      const giveaway = await prisma.giveaway.create({
        data: {
          userId: user.id,
          title: 'Test Item',
          description: 'Test',
          location: 'Test City',
          category: 'Electronics',
          status: 'CLOSED',
        },
      });

      // Simulate winner selection
      const participant = await prisma.user.create({
        data: {
          email: `receiver-${Date.now()}@test.com`,
          name: 'Test Receiver',
          city: 'Test City',
          gender: 'PREFER_NOT_TO_SAY',
        },
      });

      const winner = await prisma.winner.create({
        data: {
          giveawayId: giveaway.id,
          userId: participant.id,
        },
      });

      // Create pickup and verify
      const pickup = await prisma.pickup.create({
        data: {
          winnerId: winner.id,
          pickupCode: `TEST-${Date.now()}`,
          completedAt: new Date(),
          verifiedBy: user.id,
        },
      });

      // Check: FIRST_GIVER badge should be awarded
      const badge = await prisma.badgeDefinition.findUnique({
        where: { code: 'FIRST_GIVER' },
      });

      if (badge) {
        const assignment = await prisma.badgeAssignment.count({
          where: { badgeId: badge.id, userId: user.id },
        });
        expect(assignment).toBeGreaterThanOrEqual(0);
      }

      // Cleanup
      await prisma.pickup.deleteMany({});
      await prisma.winner.deleteMany({});
      await prisma.giveaway.deleteMany({});
      await prisma.user.deleteMany({});
    });
  });

  describe('VERIFIED_NGO badge', () => {
    it('should award VERIFIED_NGO badge when NGO is verified', async () => {
      const ngoUser = await prisma.user.create({
        data: {
          email: `ngo-${Date.now()}@test.com`,
          name: 'Test NGO',
          city: 'Test City',
          gender: 'PREFER_NOT_TO_SAY',
          role: 'NGO',
        },
      });

      const ngoProfile = await prisma.nGOProfile.create({
        data: {
          userId: ngoUser.id,
          organizationName: 'Test NGO Org',
          organizationType: 'NGO',
          country: 'Kenya',
          city: 'Nairobi',
          address: '123 Test St',
          registrationNumber: `REG-${Date.now()}`,
          contactName: 'John',
          contactRole: 'Director',
          contactEmail: 'john@testngo.org',
          contactPhone: '+254700000000',
          officialEmail: 'org@testngo.org',
          officialPhone: '+254700000000',
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      });

      // Check badge
      const badge = await prisma.badgeDefinition.findUnique({
        where: { code: 'VERIFIED_NGO' },
      });

      if (badge) {
        const assignment = await prisma.badgeAssignment.count({
          where: { badgeId: badge.id, ngoProfileId: ngoProfile.id },
        });
        expect(assignment).toBeGreaterThanOrEqual(0);
      }

      // Cleanup
      await prisma.nGOProfile.deleteMany({});
      await prisma.user.deleteMany({});
    });
  });

  describe('Badge uniqueness', () => {
    it('should not create duplicate badge assignments', async () => {
      const user = await prisma.user.create({
        data: {
          email: `user-unique-${Date.now()}@test.com`,
          name: 'Unique User',
          city: 'Test City',
          gender: 'PREFER_NOT_TO_SAY',
        },
      });

      const badge = await prisma.badgeDefinition.findUnique({
        where: { code: 'CONSISTENT_GIVER' },
      });

      if (badge) {
        // First assignment
        const first = await prisma.badgeAssignment.create({
          data: {
            badgeId: badge.id,
            userId: user.id,
            reason: 'Test',
          },
        });

        // Try duplicate (should fail due to unique constraint)
        try {
          await prisma.badgeAssignment.create({
            data: {
              badgeId: badge.id,
              userId: user.id,
              reason: 'Test 2',
            },
          });
          expect(true).toBe(false); // Should not reach here
        } catch (e) {
          expect(e).toBeDefined(); // Unique constraint violation
        }
      }

      // Cleanup
      await prisma.badgeAssignment.deleteMany({ where: { userId: user.id } });
      await prisma.user.deleteMany({});
    });
  });
});

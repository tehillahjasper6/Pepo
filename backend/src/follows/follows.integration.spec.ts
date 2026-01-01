import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('FollowsController & Service Integration Tests', () => {
  let app: INestApplication;
  let followsService: FollowsService;
  let prismaService: PrismaService;

  const testUserId = 'test-user-1';
  const testNgoId = 'test-ngo-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FollowsController],
      providers: [
        FollowsService,
        {
          provide: PrismaService,
          useValue: {
            follow: {
              create: jest.fn(),
              deleteMany: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              createMany: jest.fn(),
            },
            nGOProfile: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
            userNGOPreference: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            $disconnect: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            store: { keys: jest.fn().mockResolvedValue([]) },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    followsService = moduleFixture.get<FollowsService>(FollowsService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Follow/Unfollow', () => {
    it('should follow an NGO successfully', async () => {
      jest.spyOn(prismaService.follow, 'findUnique').mockResolvedValueOnce(null);
      jest
        .spyOn(prismaService.nGOProfile, 'findUnique')
        .mockResolvedValueOnce({ id: testNgoId } as any);
      jest.spyOn(prismaService.follow, 'create').mockResolvedValueOnce({
        id: 'follow-1',
        userId: testUserId,
        ngoId: testNgoId,
        createdAt: new Date(),
      } as any);

      const result = await followsService.follow(testUserId, testNgoId);

      expect(result).toHaveProperty('id');
      expect(prismaService.follow.create).toHaveBeenCalled();
    });

    it('should prevent duplicate follows', async () => {
      jest
        .spyOn(prismaService.follow, 'findUnique')
        .mockResolvedValueOnce({ id: 'follow-1' } as any);

      await expect(followsService.follow(testUserId, testNgoId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should unfollow an NGO', async () => {
      jest.spyOn(prismaService.follow, 'deleteMany').mockResolvedValueOnce({ count: 1 });

      const result = await followsService.unfollow(testUserId, testNgoId);

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should throw error when unfollowing non-followed NGO', async () => {
      jest.spyOn(prismaService.follow, 'deleteMany').mockResolvedValueOnce({ count: 0 });

      await expect(followsService.unfollow(testUserId, testNgoId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('List & Query', () => {
    it('should list followed NGOs with pagination', async () => {
      const mockFollows = [
        {
          id: 'follow-1',
          userId: testUserId,
          ngoId: 'ngo-1',
          createdAt: new Date(),
          ngo: {
            organizationName: 'NGO 1',
            impactScore: 0.9,
            category: 'health',
            _count: { follows: 1000 },
          },
        },
      ];

      jest.spyOn(prismaService.follow, 'findMany').mockResolvedValueOnce(mockFollows as any);
      jest.spyOn(prismaService.follow, 'count').mockResolvedValueOnce(1);

      const result = await followsService.listFollowedNGOs(testUserId, {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should check follow status', async () => {
      jest.spyOn(prismaService.follow, 'findUnique').mockResolvedValueOnce({ id: 'follow-1' } as any);
      jest.spyOn(prismaService.userNGOPreference, 'findUnique').mockResolvedValueOnce(null);

      const result = await followsService.isFollowing(testUserId, testNgoId);

      expect(result.isFollowing).toBe(true);
      expect(result.isMuted).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    it('should batch follow multiple NGOs', async () => {
      const ngoIds = ['ngo-1', 'ngo-2', 'ngo-3'];

      jest.spyOn(prismaService.follow, 'findMany').mockResolvedValueOnce([]);
      jest
        .spyOn(prismaService.nGOProfile, 'findMany')
        .mockResolvedValueOnce(ngoIds.map((id) => ({ id })) as any);
      jest.spyOn(prismaService.follow, 'createMany').mockResolvedValueOnce({ count: 3 });

      const result = await followsService.batchFollow(testUserId, ngoIds, 'follow');

      expect(result.success).toBe(true);
      expect(result.created).toBe(3);
    });

    it('should handle partial duplicates in batch', async () => {
      const ngoIds = ['ngo-1', 'ngo-2'];

      jest
        .spyOn(prismaService.follow, 'findMany')
        .mockResolvedValueOnce([{ ngoId: 'ngo-1' }] as any);
      jest.spyOn(prismaService.nGOProfile, 'findMany').mockResolvedValueOnce([{ id: 'ngo-2' }] as any);
      jest.spyOn(prismaService.follow, 'createMany').mockResolvedValueOnce({ count: 1 });

      const result = await followsService.batchFollow(testUserId, ngoIds, 'follow');

      expect(result.created).toBe(1);
    });

    it('should reject batch operations exceeding 50 items', async () => {
      const ngoIds = Array.from({ length: 51 }, (_, i) => `ngo-${i}`);

      await expect(followsService.batchFollow(testUserId, ngoIds, 'follow')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Discovery & Recommendations', () => {
    it('should get trending NGOs', async () => {
      const mockTrending = [
        {
          id: 'ngo-1',
          organizationName: 'Trending NGO',
          impactScore: 0.95,
          category: 'health',
          _count: { follows: 5000 },
        },
      ];

      jest.spyOn(prismaService.nGOProfile, 'findMany').mockResolvedValueOnce(mockTrending as any);

      const result = await followsService.getTrendingNGOs(10);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Trending NGO');
    });

    it('should get suggestions for user', async () => {
      jest
        .spyOn(prismaService.follow, 'findMany')
        .mockResolvedValueOnce([{ ngoId: 'ngo-1' }] as any);
      jest
        .spyOn(prismaService.nGOProfile, 'findMany')
        .mockResolvedValueOnce([{ category: 'health' }] as any)
        .mockResolvedValueOnce([
          {
            id: 'ngo-2',
            organizationName: 'Suggested NGO',
            category: 'health',
            impactScore: 0.85,
            _count: { follows: 2000 },
          },
        ] as any);

      const result = await followsService.getSuggestionsForUser(testUserId, 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should get mutual follows', async () => {
      const mockMutuals = [
        {
          user: {
            id: 'user-2',
            name: 'Other User',
            avatar: 'https://example.com/avatar.jpg',
          },
        },
      ];

      jest.spyOn(prismaService.follow, 'findMany').mockResolvedValueOnce(mockMutuals as any);

      const result = await followsService.getMutualFollows(testUserId, testNgoId);

      expect(result.mutualFollowers).toHaveLength(1);
      expect(result.mutualFollowers[0].name).toBe('Other User');
    });
  });

  describe('Mute/Unmute', () => {
    it('should mute an NGO', async () => {
      jest.spyOn(prismaService.userNGOPreference, 'upsert').mockResolvedValueOnce({
        userId: testUserId,
        ngoId: testNgoId,
        isMuted: true,
        muteReason: 'Not interested',
      } as any);

      const result = await followsService.muteNGO(testUserId, testNgoId, 'Not interested');

      expect(result.success).toBe(true);
      expect(result.isMuted).toBe(true);
    });

    it('should unmute an NGO', async () => {
      jest.spyOn(prismaService.userNGOPreference, 'upsert').mockResolvedValueOnce({
        userId: testUserId,
        ngoId: testNgoId,
        isMuted: false,
      } as any);

      const result = await followsService.unmuteNGO(testUserId, testNgoId);

      expect(result.success).toBe(true);
      expect(result.isMuted).toBe(false);
    });
  });
});

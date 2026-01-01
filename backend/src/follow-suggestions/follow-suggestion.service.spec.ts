import { Test, TestingModule } from '@nestjs/testing';
import { FollowSuggestionService } from './follow-suggestion.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FollowSuggestionService', () => {
  let service: FollowSuggestionService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowSuggestionService,
        {
          provide: PrismaService,
          useValue: {
            follow: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            nGOProfile: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            giveaway: {
              findMany: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            participant: {
              count: jest.fn(),
            },
            followSuggestion: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FollowSuggestionService>(FollowSuggestionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getSuggestionsForUser', () => {
    it('should return suggestions for user', async () => {
      const userId = 'user-123';
      const suggestions = [
        {
          id: 'sugg-1',
          userId,
          suggestedNGOId: 'ngo-1',
          confidenceScore: 0.85,
          reason: 'Based on your interests',
          isViewed: false,
          isFollowed: false,
          isIgnored: false,
          expiresAt: new Date(),
          suggestedNGO: {
            id: 'ngo-1',
            organizationName: 'Test NGO',
          },
        },
      ];

      jest
        .spyOn(prismaService.followSuggestion, 'findMany')
        .mockResolvedValue(suggestions as any);

      const result = await service.getSuggestionsForUser(userId);

      expect(result).toEqual(suggestions);
      expect(prismaService.followSuggestion.findMany).toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
      const userId = 'user-123';

      jest
        .spyOn(prismaService.followSuggestion, 'findMany')
        .mockResolvedValue([]);

      await service.getSuggestionsForUser(userId, { limit: 5 });

      const call = jest.mocked(prismaService.followSuggestion.findMany).mock
        .calls[0];
      expect(call[0].take).toBe(5);
    });
  });

  describe('markSuggestionAsViewed', () => {
    it('should mark suggestion as viewed', async () => {
      const suggestionId = 'sugg-123';
      const updated = { id: suggestionId, isViewed: true };

      jest
        .spyOn(prismaService.followSuggestion, 'update')
        .mockResolvedValue(updated as any);

      const result = await service.markSuggestionAsViewed(suggestionId);

      expect(result).toEqual(updated);
      expect(prismaService.followSuggestion.update).toHaveBeenCalledWith({
        where: { id: suggestionId },
        data: { isViewed: true },
      });
    });
  });

  describe('markSuggestionAsFollowed', () => {
    it('should mark suggestion as followed', async () => {
      const suggestionId = 'sugg-123';
      const updated = { id: suggestionId, isFollowed: true };

      jest
        .spyOn(prismaService.followSuggestion, 'update')
        .mockResolvedValue(updated as any);

      const result = await service.markSuggestionAsFollowed(suggestionId);

      expect(result).toEqual(updated);
      expect(prismaService.followSuggestion.update).toHaveBeenCalledWith({
        where: { id: suggestionId },
        data: { isFollowed: true },
      });
    });
  });

  describe('markSuggestionAsIgnored', () => {
    it('should mark suggestion as ignored', async () => {
      const suggestionId = 'sugg-123';
      const updated = { id: suggestionId, isIgnored: true };

      jest
        .spyOn(prismaService.followSuggestion, 'update')
        .mockResolvedValue(updated as any);

      const result = await service.markSuggestionAsIgnored(suggestionId);

      expect(result).toEqual(updated);
      expect(prismaService.followSuggestion.update).toHaveBeenCalledWith({
        where: { id: suggestionId },
        data: { isIgnored: true },
      });
    });
  });

  describe('cleanupExpiredSuggestions', () => {
    it('should delete expired suggestions', async () => {
      const result = { count: 15 };

      jest
        .spyOn(prismaService.followSuggestion, 'deleteMany')
        .mockResolvedValue(result as any);

      const output = await service.cleanupExpiredSuggestions();

      expect(output).toBe(15);
      expect(prismaService.followSuggestion.deleteMany).toHaveBeenCalled();
    });
  });

  describe('generateSuggestionsForUser', () => {
    it('should generate suggestions for user', async () => {
      const userId = 'user-123';

      jest
        .spyOn(prismaService.follow, 'findMany')
        .mockResolvedValue([{ ngoId: 'ngo-1' }] as any);

      jest.spyOn(prismaService.nGOProfile, 'findMany').mockResolvedValue([
        {
          id: 'ngo-2',
          organizationName: 'Other NGO',
          _count: { followers: 100 },
        },
      ] as any);

      jest
        .spyOn(prismaService.followSuggestion, 'deleteMany')
        .mockResolvedValue({ count: 0 } as any);

      jest
        .spyOn(prismaService.followSuggestion, 'create')
        .mockResolvedValue({} as any);

      const result = await service.generateSuggestionsForUser(userId);

      expect(Array.isArray(result)).toBe(true);
      expect(prismaService.followSuggestion.deleteMany).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-123';

      jest
        .spyOn(prismaService.follow, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.generateSuggestionsForUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('refreshAllSuggestions', () => {
    it('should refresh suggestions for all users', async () => {
      jest
        .spyOn(prismaService.follow, 'findMany')
        .mockResolvedValue([{ userId: 'user-1' }, { userId: 'user-2' }] as any);

      jest
        .spyOn(service, 'generateSuggestionsForUser')
        .mockResolvedValue([]);

      jest
        .spyOn(service, 'cleanupExpiredSuggestions')
        .mockResolvedValue(5);

      const result = await service.refreshAllSuggestions();

      expect(result).toBe(2);
      expect(service.generateSuggestionsForUser).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(prismaService.follow, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.refreshAllSuggestions();

      expect(result).toBe(0);
    });
  });
});

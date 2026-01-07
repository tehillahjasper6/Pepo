import { Test, TestingModule } from '@nestjs/testing';
import { DigestService } from './digest.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DigestFrequency, DigestChannel } from '@prisma/client';

describe('DigestService', () => {
  let service: DigestService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigestService,
        {
          provide: PrismaService,
          useValue: {
            userDigestPreference: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn().mockResolvedValue([]), // Always return array
            },
            follow: {
              findMany: jest.fn().mockResolvedValue([]), // Always return array
            },
            giveaway: {
              findMany: jest.fn().mockResolvedValue([]), // Always return array
            },
            campaign: {
              findMany: jest.fn().mockResolvedValue([]), // Always return array
            },
            participant: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendPushNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DigestService>(DigestService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  describe('getOrCreateDigestPreference', () => {
    it('should return existing preference', async () => {
      const userId = 'user-123';
      const preference = {
        userId,
        frequency: DigestFrequency.DAILY,
        isEnabled: true,
        channels: [DigestChannel.IN_APP],
      };

      jest
        .spyOn(prismaService.userDigestPreference, 'findUnique')
        .mockResolvedValue(preference as any);

      const result = await service.getOrCreateDigestPreference(userId);

      expect(result).toEqual(preference);
      expect(prismaService.userDigestPreference.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should create new preference if not found', async () => {
      const userId = 'user-456';
      const newPreference = {
        userId,
        frequency: DigestFrequency.DAILY,
        isEnabled: true,
        channels: [DigestChannel.IN_APP],
        includeNewPosts: true,
        includeCampaigns: true,
        includeCompleted: false,
      };

      jest
        .spyOn(prismaService.userDigestPreference, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(prismaService.userDigestPreference, 'create')
        .mockResolvedValue(newPreference as any);

      const result = await service.getOrCreateDigestPreference(userId);

      expect(result).toEqual(newPreference);
      expect(prismaService.userDigestPreference.create).toHaveBeenCalled();
    });
  });

  describe('updateDigestPreference', () => {
    it('should update user digest preference', async () => {
      const userId = 'user-123';
      const updates = {
        frequency: DigestFrequency.WEEKLY,
        isEnabled: false,
      };
      const updatedPreference = {
        userId,
        ...updates,
      };

      jest
        .spyOn(prismaService.userDigestPreference, 'update')
        .mockResolvedValue(updatedPreference as any);

      const result = await service.updateDigestPreference(userId, updates);

      expect(result).toEqual(updatedPreference);
      expect(prismaService.userDigestPreference.update).toHaveBeenCalledWith({
        where: { userId },
        data: updates,
      });
    });
  });

  describe('toggleDigest', () => {
    it('should toggle digest on/off', async () => {
      const userId = 'user-123';
      const updatedPref = { userId, isEnabled: true };

      jest
        .spyOn(service, 'updateDigestPreference')
        .mockResolvedValue(updatedPref as any);

      const result = await service.toggleDigest(userId, true);

      expect(result).toEqual(updatedPref);
      expect(service.updateDigestPreference).toHaveBeenCalledWith(userId, {
        isEnabled: true,
      });
    });
  });

  describe('updateDigestFrequency', () => {
    it('should update digest frequency', async () => {
      const userId = 'user-123';
      const updatedPref = { userId, frequency: DigestFrequency.WEEKLY };

      jest
        .spyOn(service, 'updateDigestPreference')
        .mockResolvedValue(updatedPref as any);

      const result = await service.updateDigestFrequency(
        userId,
        DigestFrequency.WEEKLY,
      );

      expect(result).toEqual(updatedPref);
      expect(service.updateDigestPreference).toHaveBeenCalledWith(userId, {
        frequency: DigestFrequency.WEEKLY,
      });
    });
  });

  describe('processPendingDigests', () => {
    it('should process pending digests', async () => {
      const pendingDigests = [
        {
          userId: 'user-1',
          frequency: DigestFrequency.DAILY,
          nextScheduledAt: new Date(),
          includeNewPosts: true,
          includeCampaigns: true,
          user: { id: 'user-1' },
        },
      ];

      jest
        .spyOn(prismaService.userDigestPreference, 'findMany')
        .mockResolvedValue(pendingDigests as any);

      // Note: generateAndSendDigest is private, so we'll test via the public method
      const result = await service.processPendingDigests();

      expect(result).toBe(1);
      expect(prismaService.userDigestPreference.findMany).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(prismaService.userDigestPreference, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.processPendingDigests();

      expect(result).toBe(0);
    });
  });

  describe('getDigestPreferences', () => {
    it('should return user digest preferences', async () => {
      const userId = 'user-123';
      const preference = {
        userId,
        frequency: DigestFrequency.DAILY,
        isEnabled: true,
      };

      jest
        .spyOn(service, 'getOrCreateDigestPreference')
        .mockResolvedValue(preference as any);

      const result = await service.getDigestPreferences(userId);

      expect(result).toEqual(preference);
    });
  });
});

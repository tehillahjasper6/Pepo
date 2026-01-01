import { Test, TestingModule } from '@nestjs/testing';
import { CampaignReminderService } from './campaign-reminder.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReminderType } from '@prisma/client';

describe('CampaignReminderService', () => {
  let service: CampaignReminderService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignReminderService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              findMany: jest.fn(),
            },
            follow: {
              findMany: jest.fn(),
            },
            campaignReminderLog: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            campaignReminderSetting: {
              findMany: jest.fn(),
              upsert: jest.fn(),
              updateMany: jest.fn(),
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

    service = module.get<CampaignReminderService>(CampaignReminderService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  describe('getCampaignReminderSettings', () => {
    it('should return campaign reminder settings', async () => {
      const campaignId = 'campaign-123';
      const settings = [
        {
          campaignId,
          reminderType: ReminderType.CAMPAIGN_LAUNCH_7DAYS,
          isEnabled: true,
        },
      ];

      jest
        .spyOn(prismaService.campaignReminderSetting, 'findMany')
        .mockResolvedValue(settings as any);

      const result = await service.getCampaignReminderSettings(campaignId);

      expect(result).toEqual(settings);
      expect(prismaService.campaignReminderSetting.findMany).toHaveBeenCalledWith({
        where: { campaignId },
      });
    });
  });

  describe('updateCampaignReminderSetting', () => {
    it('should update campaign reminder setting', async () => {
      const campaignId = 'campaign-123';
      const reminderType = ReminderType.CAMPAIGN_LAUNCH_24HOURS;
      const updated = {
        campaignId,
        reminderType,
        isEnabled: true,
      };

      jest
        .spyOn(prismaService.campaignReminderSetting, 'upsert')
        .mockResolvedValue(updated as any);

      const result = await service.updateCampaignReminderSetting(
        campaignId,
        reminderType,
        true,
      );

      expect(result).toEqual(updated);
      expect(prismaService.campaignReminderSetting.upsert).toHaveBeenCalled();
    });
  });

  describe('disableCampaignReminders', () => {
    it('should disable all campaign reminders', async () => {
      const campaignId = 'campaign-123';
      const result = { count: 5 };

      jest
        .spyOn(prismaService.campaignReminderSetting, 'updateMany')
        .mockResolvedValue(result as any);

      const output = await service.disableCampaignReminders(campaignId);

      expect(prismaService.campaignReminderSetting.updateMany).toHaveBeenCalledWith({
        where: { campaignId },
        data: { isEnabled: false },
      });
    });
  });

  describe('getCampaignReminderLogs', () => {
    it('should return campaign reminder logs', async () => {
      const campaignId = 'campaign-123';
      const logs = [
        {
          userId: 'user-1',
          campaignId,
          reminderType: ReminderType.CAMPAIGN_LAUNCH_7DAYS,
          sentAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.campaignReminderLog, 'findMany')
        .mockResolvedValue(logs as any);

      const result = await service.getCampaignReminderLogs(campaignId);

      expect(result).toEqual(logs);
      expect(prismaService.campaignReminderLog.findMany).toHaveBeenCalledWith({
        where: { campaignId },
        orderBy: { sentAt: 'desc' },
        take: 100,
      });
    });
  });

  describe('cleanupOldReminderLogs', () => {
    it('should delete old reminder logs', async () => {
      const result = { count: 42 };

      jest
        .spyOn(prismaService.campaignReminderLog, 'deleteMany')
        .mockResolvedValue(result as any);

      const output = await service.cleanupOldReminderLogs(90);

      expect(output).toBe(42);
      expect(prismaService.campaignReminderLog.deleteMany).toHaveBeenCalled();
    });
  });

  describe('processPendingReminders', () => {
    it('should process pending reminders', async () => {
      const campaigns = [
        {
          id: 'campaign-1',
          title: 'Test Campaign',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          isActive: true,
          reminderSettings: [],
          ngoProfile: {
            followers: [],
          },
        },
      ];

      jest
        .spyOn(prismaService.campaign, 'findMany')
        .mockResolvedValue(campaigns as any);

      const result = await service.processPendingReminders();

      expect(result).toBe(1);
      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          reminderSettings: true,
          ngoProfile: {
            include: {
              followers: true,
            },
          },
        },
      });
    });

    it('should handle errors gracefully', async () => {
      jest
        .spyOn(prismaService.campaign, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      const result = await service.processPendingReminders();

      expect(result).toBe(0);
    });
  });
});

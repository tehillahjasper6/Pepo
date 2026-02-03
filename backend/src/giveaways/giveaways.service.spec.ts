import { Test, TestingModule } from '@nestjs/testing';
import { GiveawaysService } from './giveaways.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('GiveawaysService', () => {
  let service: GiveawaysService;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiveawaysService,
        {
          provide: PrismaService,
          useValue: {
            giveaway: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            participant: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
            notification: {
              create: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadMultiple: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GiveawaysService>(GiveawaysService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new giveaway', async () => {
      const userId = 'user-1';
      const data = {
        title: 'Test Giveaway',
        description: 'Test Description',
        category: 'Furniture',
        location: 'New York',
        eligibilityGender: 'ALL',
        publish: true,
      };
      const files = [] as Express.Multer.File[];

      const mockGiveaway = {
        id: 'giveaway-1',
        ...data,
        userId,
        images: [],
        status: 'OPEN',
        createdAt: new Date(),
      };

      jest.spyOn(cloudinaryService, 'uploadMultiple').mockResolvedValue([]);
      jest.spyOn(prismaService.giveaway, 'create').mockResolvedValue(mockGiveaway as any);
      jest.spyOn(prismaService.auditLog, 'create').mockResolvedValue({} as any);

      const result = await service.create(userId, data, files);

      expect(cloudinaryService.uploadMultiple).toHaveBeenCalled();
      expect(prismaService.giveaway.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('OPEN');
    });
  });

  describe('findAll', () => {
    it('should return paginated giveaways', async () => {
      const filters = { page: '1', limit: '12' };
      const mockGiveaways = [
        { id: '1', title: 'Giveaway 1', status: 'OPEN' },
        { id: '2', title: 'Giveaway 2', status: 'OPEN' },
      ];

      jest.spyOn(prismaService.giveaway, 'count').mockResolvedValue(2);
      jest.spyOn(prismaService.giveaway, 'findMany').mockResolvedValue(mockGiveaways as any);

      const result = await service.findAll(filters);

      expect(result).toHaveProperty('giveaways');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('expressInterest', () => {
    it('should create participation', async () => {
      const giveawayId = 'giveaway-1';
      const userId = 'user-1';

      const mockGiveaway = {
        id: giveawayId,
        userId: 'user-2',
        status: 'OPEN',
        eligibilityGender: 'ALL',
      };

      jest.spyOn(prismaService.giveaway, 'findUnique').mockResolvedValue(mockGiveaway as any);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: userId,
        gender: 'MALE',
      } as any);
      jest.spyOn(prismaService.participant, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.participant, 'create').mockResolvedValue({
        id: 'part-1',
        userId,
        giveawayId,
      } as any);
      jest.spyOn(prismaService.notification, 'create').mockResolvedValue({} as any);

      const result = await service.expressInterest(giveawayId, userId);

      expect(prismaService.participant.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw error if giveaway is not open', async () => {
      const giveawayId = 'giveaway-1';
      const userId = 'user-1';

      const mockGiveaway = {
        id: giveawayId,
        status: 'CLOSED',
      };

      jest.spyOn(prismaService.giveaway, 'findUnique').mockResolvedValue(mockGiveaway as any);

      await expect(service.expressInterest(giveawayId, userId)).rejects.toThrow();
    });
  });
});





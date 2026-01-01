import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/badges')
export class BadgesController {
  constructor(private prisma: PrismaService) {}

  @Get('definitions')
  async getDefinitions() {
    return this.prisma.badgeDefinition.findMany({ orderBy: { name: 'asc' } });
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    return this.prisma.badgeAssignment.findMany({
      where: { userId, isRevoked: false },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('ngo/:ngoId')
  async getNgoBadges(@Param('ngoId') ngoId: string) {
    return this.prisma.badgeAssignment.findMany({
      where: { ngoProfileId: ngoId, isRevoked: false },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
  }

  // Admin audit endpoint
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/assignments')
  async getAssignments(@Query() query: any, @Req() req: any) {
    // RolesGuard should ensure admin role for this route
    const where: any = {};
    if (query.badgeCode) {
      const def = await this.prisma.badgeDefinition.findUnique({ where: { code: query.badgeCode } });
      if (def) where.badgeId = def.id;
    }
    if (query.userId) where.userId = query.userId;
    if (query.ngoId) where.ngoProfileId = query.ngoId;

    return this.prisma.badgeAssignment.findMany({
      where,
      include: { badge: true, user: { select: { id: true, name: true, email: true } }, ngoProfile: true },
      orderBy: { awardedAt: 'desc' },
      take: 200,
    });
  }
}

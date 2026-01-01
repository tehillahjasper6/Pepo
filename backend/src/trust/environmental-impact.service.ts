import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface EnvironmentalValues {
  [category: string]: {
    co2kg: number;
    wastekg: number;
  };
}

@Injectable()
export class EnvironmentalImpactService {
  // Environmental impact values per item category (kg CO2, kg waste diverted)
  private categoryValues: EnvironmentalValues = {
    electronics: { co2kg: 50, wastekg: 2.5 },
    furniture: { co2kg: 30, wastekg: 15 },
    clothing: { co2kg: 5, wastekg: 0.5 },
    books: { co2kg: 2, wastekg: 0.2 },
    toys: { co2kg: 3, wastekg: 0.3 },
    kitchen: { co2kg: 8, wastekg: 1 },
    sports: { co2kg: 10, wastekg: 1.5 },
    garden: { co2kg: 15, wastekg: 5 },
    other: { co2kg: 5, wastekg: 1 },
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate environmental impact when user gives away item
   */
  async recordGiveaway(userId: string, category: string, quantity = 1) {
    const values = this.categoryValues[category.toLowerCase()] || this.categoryValues.other;
    
    const co2Impact = values.co2kg * quantity;
    const wasteImpact = values.wastekg * quantity;

    let impact = await this.prisma.environmentalImpact.findUnique({
      where: { userId },
    });

    if (!impact) {
      impact = await this.prisma.environmentalImpact.create({
        data: {
          userId,
          estimatedCO2Saved: 0,
          estimatedWasteDiverted: 0,
          itemsCategoryBreakdown: {},
        },
      });
    }

    // Update totals
    const updated = await this.prisma.environmentalImpact.update({
      where: { userId },
      data: {
        estimatedCO2Saved: { increment: co2Impact },
        estimatedWasteDiverted: { increment: wasteImpact },
        itemsCategoryBreakdown: this.updateCategoryBreakdown(
          (impact.itemsCategoryBreakdown as any) || {},
          category.toLowerCase(),
          co2Impact,
          wasteImpact,
          quantity
        ),
      },
    });

    return updated;
  }

  /**
   * Get environmental impact stats for user
   */
  async getUserImpact(userId: string) {
    const impact = await this.prisma.environmentalImpact.findUnique({
      where: { userId },
    });

    if (!impact) {
      return {
        userId,
        estimatedCO2Saved: 0,
        estimatedWasteDiverted: 0,
        equivalents: {
          carMilesDriven: 0,
          treesPlanted: 0,
          plasticBottles: 0,
        },
        categoryBreakdown: {},
      };
    }

    return {
      userId,
      estimatedCO2Saved: impact.estimatedCO2Saved,
      estimatedWasteDiverted: impact.estimatedWasteDiverted,
      equivalents: this.calculateEquivalents(impact.estimatedCO2Saved, impact.estimatedWasteDiverted),
      categoryBreakdown: impact.itemsCategoryBreakdown,
    };
  }

  /**
   * Get leaderboard of top environmental contributors
   */
  async getLeaderboard(limit = 10) {
    const impacts = await this.prisma.environmentalImpact.findMany({
      where: { estimatedCO2Saved: { gt: 0 } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { estimatedCO2Saved: 'desc' },
      take: limit,
    });

    return impacts.map((impact, rank) => ({
      rank: rank + 1,
      user: impact.user,
      estimatedCO2Saved: impact.estimatedCO2Saved,
      estimatedWasteDiverted: impact.estimatedWasteDiverted,
      badge: this.determineBadge(impact.estimatedCO2Saved),
      equivalents: this.calculateEquivalents(impact.estimatedCO2Saved, impact.estimatedWasteDiverted),
    }));
  }

  /**
   * Get aggregate platform impact
   */
  async getPlatformImpact() {
    const result = await this.prisma.environmentalImpact.aggregate({
      _sum: { estimatedCO2Saved: true, estimatedWasteDiverted: true },
      _avg: { estimatedCO2Saved: true, estimatedWasteDiverted: true },
      _count: true,
    });

    const totalCO2 = result._sum.estimatedCO2Saved || 0;
    const totalWaste = result._sum.estimatedWasteDiverted || 0;

    return {
      totalCO2SavedKg: totalCO2,
      totalWasteDivertedKg: totalWaste,
      averagePerUserCO2: result._avg.estimatedCO2Saved || 0,
      averagePerUserWaste: result._avg.estimatedWasteDiverted || 0,
      participatingUsers: result._count,
      equivalents: this.calculateEquivalents(totalCO2, totalWaste),
    };
  }

  /**
   * Get impact by category
   */
  async getImpactByCategory(category: string) {
    const impacts = await this.prisma.environmentalImpact.findMany({
      where: {
        itemsCategoryBreakdown: {
          path: [category.toLowerCase()],
          not: { equals: undefined },
        },
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return impacts
      .map(impact => ({
        ...impact,
        categoryImpact: (impact.itemsCategoryBreakdown as any)?.[category.toLowerCase()],
      }))
      .sort((a, b) => (b.categoryImpact?.co2 || 0) - (a.categoryImpact?.co2 || 0));
  }

  /**
   * Generate monthly impact report
   */
  async getMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const giveaways = await this.prisma.giveaway.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
      },
      include: { user: true },
    });

    let totalCO2 = 0;
    let totalWaste = 0;
    const byCategory: any = {};

    for (const giveaway of giveaways) {
      const values = this.categoryValues[giveaway.category.toLowerCase()] || this.categoryValues.other;
      totalCO2 += values.co2kg;
      totalWaste += values.wastekg;

      if (!byCategory[giveaway.category]) {
        byCategory[giveaway.category] = { count: 0, co2: 0, waste: 0 };
      }
      byCategory[giveaway.category].count += 1;
      byCategory[giveaway.category].co2 += values.co2kg;
      byCategory[giveaway.category].waste += values.wastekg;
    }

    return {
      year,
      month,
      totalGiveawaysCompleted: giveaways.length,
      totalCO2SavedKg: totalCO2,
      totalWasteDivertedKg: totalWaste,
      byCategory,
      equivalents: this.calculateEquivalents(totalCO2, totalWaste),
    };
  }

  // Helper methods

  private updateCategoryBreakdown(
    current: any,
    category: string,
    co2: number,
    waste: number,
    quantity: number,
  ): any {
    const breakdown = { ...current };
    if (!breakdown[category]) {
      breakdown[category] = { count: 0, co2: 0, waste: 0 };
    }
    breakdown[category].count += quantity;
    breakdown[category].co2 += co2;
    breakdown[category].waste += waste;
    return breakdown;
  }

  private calculateEquivalents(co2kg: number, wastekg: number) {
    return {
      carMilesDriven: Math.round(co2kg / 0.41), // 0.41 kg CO2 per mile driven
      treesPlanted: Math.round(co2kg / 20), // 20 kg CO2 per tree per year
      plasticBottles: Math.round(wastekg / 0.025), // 25g per bottle
      showerMinutes: Math.round(co2kg / 0.0085), // 8.5g CO2 per minute shower
    };
  }

  private determineBadge(co2Saved: number): string {
    if (co2Saved >= 500) return 'eco-champion';
    if (co2Saved >= 250) return 'eco-warrior';
    if (co2Saved >= 100) return 'eco-friend';
    if (co2Saved >= 50) return 'eco-starter';
    return 'eco-aware';
  }
}

import prisma from "../utils/client";

export class PayoutPeriodAction {
  public static async createPeriod(data: {
    period: string;
    startDate: Date | string;
    endDate: Date | string;
  }) {
    // 1. Un-mark previous active payout periods
    await prisma.payoutPeriod.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });

    // 2. Create new period with required dates
    return await prisma.payoutPeriod.create({
      data: {
        period: data.period,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isCurrent: true,
      },
    });
  }

  public static async getAllPeriods() {
    return await prisma.payoutPeriod.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updatePeriod(
    id: string,
    data: {
      period?: string;
      startDate?: Date | string;
      endDate?: Date | string;
      isCurrent?: boolean;
    },
  ) {
    return await prisma.payoutPeriod.update({
      where: { id },
      data: {
        ...(data.period && { period: data.period }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
      },
    });
  }

  public static async softDeletePeriod(id: string) {
    return await prisma.payoutPeriod.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

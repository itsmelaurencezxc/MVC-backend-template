import prisma from "../utils/client";

export class PayoutPeriodAction {
  public static async createPeriod(periodName: string) {
    await prisma.payoutPeriod.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
    return await prisma.payoutPeriod.create({
      data: {
        period: periodName,
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
  static async updatePeriod(id: string, period: string) {
    return await prisma.payoutPeriod.update({
      where: { id },
      data: { period },
    });
  }
  public static async softDeletePeriod(id: string) {
    return await prisma.payoutPeriod.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

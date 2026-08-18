import prisma from "../utils/client";

export class PayoutPeriodAction {
  public static async createPeriod(data: {
    period: string;
    startDate: Date | string;
    endDate: Date | string;
  }) {
    return await prisma.$transaction(async (tx) => {
      await tx.payoutPeriod.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });

      return await tx.payoutPeriod.create({
        data: {
          period: data.period,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          isCurrent: true,
        },
      });
    });
  }

  public static async getAllPeriods() {
    return await prisma.payoutPeriod.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  // 3. GET PERIOD BY ID (Dagdag ito)
  public static async getPeriodById(id: string) {
    return await prisma.payoutPeriod.findFirst({
      where: { id, deletedAt: null },
    });
  }

  // 4. UPDATE PERIOD
  public static async updatePeriod(
    id: string,
    data: {
      period?: string;
      startDate?: Date | string;
      endDate?: Date | string;
      isCurrent?: boolean;
    },
  ) {
    if (data.isCurrent === true) {
      await prisma.payoutPeriod.updateMany({
        where: { isCurrent: true, id: { not: id } },
        data: { isCurrent: false },
      });
    }

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

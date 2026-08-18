import prisma from "../utils/client";

export class SalaryRecordAction {
  public static async getAll() {
    return await prisma.salaryRecord.findMany({
      where: { deletedAt: null },
      include: {
        payoutPeriod: {
          select: { period: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public static async getPeriodRecordsWithSummary(payoutPeriodId: string) {
    return await this.getByPeriod(payoutPeriodId);
  }

  public static async getByPeriod(payoutPeriodId: string) {
    const records = await prisma.salaryRecord.findMany({
      where: { payoutPeriodId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    let totalGross = 0;
    let totalSalary = 0;
    let claimedSalary = 0;
    let remainingUnclaimedSalary = 0;

    records.forEach((rec) => {
      const gross = Number(rec.grossEarnings || 0);
      const sal = Number(rec.salary || 0);

      totalGross += gross;
      totalSalary += sal;

      if (rec.isClaimed) {
        claimedSalary += sal;
      } else {
        remainingUnclaimedSalary += sal;
      }
    });

    const shopMechanicEarnings = totalGross - totalSalary;
    const finalEarnings = shopMechanicEarnings;

    return {
      records,
      summary: {
        totalGross,
        totalSalary,
        shopMechanicEarnings,
        finalEarnings,
        claimedSalary,
        remainingUnclaimedSalary,
      },
    };
  }

  public static async create(data: {
    name: string;
    grossEarnings: number;
    commissionRate: number;
    recmats?: string;
    isClaimed?: boolean;
    payoutPeriodId: string;
  }) {
    const rateDecimal = data.commissionRate / 100;
    const computedSalary = data.grossEarnings * rateDecimal;

    const record = await prisma.salaryRecord.create({
      data: {
        name: data.name,
        grossEarnings: data.grossEarnings,
        salary: computedSalary,
        recmats: data.recmats || null,
        isClaimed: data.isClaimed || false,
        payoutPeriodId: data.payoutPeriodId,
      },
    });

    await prisma.earningsLog.create({
      data: {
        salaryRecordId: record.id,
        amount: data.grossEarnings,
      },
    });

    return record;
  }

  public static async update(
    id: string,
    data: {
      name?: string;
      grossEarnings?: number;
      commissionRate?: number;
      recmats?: string;
      isClaimed?: boolean;
    },
  ) {
    const updatePayload: {
      name?: string;
      grossEarnings?: number;
      salary?: number;
      recmats?: string | null;
      isClaimed?: boolean;
    } = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.recmats !== undefined) updatePayload.recmats = data.recmats;
    if (data.isClaimed !== undefined) updatePayload.isClaimed = data.isClaimed;

    // Recalculate salary if grossEarnings or commissionRate changes
    if (data.grossEarnings !== undefined || data.commissionRate !== undefined) {
      const existingRecord = await prisma.salaryRecord.findUnique({
        where: { id },
      });

      if (existingRecord) {
        const gross =
          data.grossEarnings ?? Number(existingRecord.grossEarnings);

        if (data.commissionRate !== undefined) {
          updatePayload.grossEarnings = gross;
          updatePayload.salary = gross * (data.commissionRate / 100);
        } else if (data.grossEarnings !== undefined) {
          updatePayload.grossEarnings = gross;
          const currentRateDecimal =
            Number(existingRecord.grossEarnings) > 0
              ? Number(existingRecord.salary) /
                Number(existingRecord.grossEarnings)
              : 0;
          updatePayload.salary = gross * currentRateDecimal;
        }
      }
    }

    return await prisma.salaryRecord.update({
      where: { id },
      data: updatePayload,
    });
  }

  public static async softDelete(id: string) {
    return await prisma.salaryRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

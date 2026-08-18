import prisma from "../utils/client";

export class SalaryRecordAction {
  static getPeriodRecordsWithSummary(payoutPeriodId: string) {
    throw new Error("Method not implemented.");
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
      const gross = Number(rec.grossEarnings);
      const sal = Number(rec.salary);

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
    const updateData: any = { ...data };

    if (data.grossEarnings !== undefined && data.commissionRate !== undefined) {
      updateData.salary = data.grossEarnings * (data.commissionRate / 100);
      delete updateData.commissionRate;
    }

    return await prisma.salaryRecord.update({
      where: { id },
      data: updateData,
    });
  }

  public static async softDelete(id: string) {
    return await prisma.salaryRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

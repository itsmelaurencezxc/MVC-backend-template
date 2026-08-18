import { Prisma } from "@prisma/client";
import prisma from "../utils/client";

export class SalaryRecordAction {
  public static async getAllRecords() {
    return await prisma.salaryRecord.findMany({
      where: { deletedAt: null },
      include: {
        employee: {
          select: { id: true, name: true },
        },
        payoutPeriod: {
          select: { id: true, period: true, isCurrent: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public static async getByPeriod(payoutPeriodId: string) {
    const records = await prisma.salaryRecord.findMany({
      where: {
        payoutPeriodId,
        deletedAt: null,
      },
      include: {
        employee: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalGross = records.reduce(
      (acc, curr) => acc + Number(curr.grossEarnings || 0),
      0,
    );

    return {
      payoutPeriodId,
      totalGross,
      totalRecords: records.length,
      records,
    };
  }

  public static async createRecord(data: {
    employeeId: string;
    payoutPeriodId: string;
    grossEarnings: number | Prisma.Decimal;
    commissionRate: number | Prisma.Decimal;
    recmats?: string;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee || employee.deletedAt) {
      throw new Error("Employee not found or archived");
    }

    const gross = Number(data.grossEarnings);
    const commRate = Number(data.commissionRate);

    const computedSalary = gross * (commRate / 100);

    return await prisma.salaryRecord.create({
      data: {
        employeeId: data.employeeId,
        payoutPeriodId: data.payoutPeriodId,
        name: employee.name,
        grossEarnings: new Prisma.Decimal(gross),
        commissionRate: new Prisma.Decimal(commRate),
        salary: new Prisma.Decimal(computedSalary),
        recmats: data.recmats || null,
        isClaimed: false,
      },
      include: {
        employee: true,
        payoutPeriod: true,
      },
    });
  }

  // 4. UPDATE SALARY RECORD
  public static async updateRecord(
    id: string,
    data: {
      grossEarnings?: number | Prisma.Decimal;
      commissionRate?: number | Prisma.Decimal;
      recmats?: string;
      isClaimed?: boolean;
    },
  ) {
    const existingRecord = await prisma.salaryRecord.findUnique({
      where: { id },
    });

    if (!existingRecord || existingRecord.deletedAt) {
      const error: any = new Error("Salary record not found");
      error.code = "P2025";
      throw error;
    }

    const gross =
      data.grossEarnings !== undefined
        ? Number(data.grossEarnings)
        : Number(existingRecord.grossEarnings);

    const commRate =
      data.commissionRate !== undefined
        ? Number(data.commissionRate)
        : Number(existingRecord.commissionRate);

    const calculatedSalary = gross * (commRate / 100);

    return await prisma.salaryRecord.update({
      where: { id },
      data: {
        grossEarnings: new Prisma.Decimal(gross),
        commissionRate: new Prisma.Decimal(commRate),
        salary: new Prisma.Decimal(calculatedSalary),
        ...(data.recmats !== undefined && { recmats: data.recmats }),
        ...(data.isClaimed !== undefined && { isClaimed: data.isClaimed }),
      },
    });
  }

  public static async softDeleteRecord(id: string) {
    return await prisma.salaryRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

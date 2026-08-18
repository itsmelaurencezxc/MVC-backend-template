import { Prisma } from "@prisma/client";
import prisma from "../utils/client";

export class SalaryRecordAction {
  // 1. GET ALL SALARY RECORDS
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

  // 2. GET RECORDS BY PAYOUT PERIOD ID (WITH ANALYTICS)
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

  // 3. CREATE SALARY RECORD
  public static async createRecord(data: {
    employeeId: string;
    payoutPeriodId: string;
    grossEarnings: number | Prisma.Decimal;
    commissionRate?: number | Prisma.Decimal;
    salary?: number | Prisma.Decimal;
    recmats?: string;
    isClaimed?: boolean;
  }) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee || employee.deletedAt) {
      throw new Error("Employee not found or archived");
    }

    return await prisma.salaryRecord.create({
      data: {
        employeeId: data.employeeId,
        payoutPeriodId: data.payoutPeriodId,
        name: employee.name,
        grossEarnings: new Prisma.Decimal(data.grossEarnings),
        // Nilagyan ng default na 0 kapag walang ipinasa
        commissionRate: new Prisma.Decimal(data.commissionRate ?? 0),
        salary: new Prisma.Decimal(data.salary ?? 0),
        recmats: data.recmats || null,
        isClaimed: data.isClaimed ?? false,
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
      salary?: number | Prisma.Decimal;
      recmats?: string;
      isClaimed?: boolean;
    },
  ) {
    // 1. Kuhanin muna ang umiiral na record sa database
    const existingRecord = await prisma.salaryRecord.findUnique({
      where: { id },
    });

    if (!existingRecord || existingRecord.deletedAt) {
      const error: any = new Error("Salary record not found");
      error.code = "P2025";
      throw error;
    }

    // 2. Alamin ang bagong values (gamitin ang dati kapag walang ipinasa)
    const gross =
      data.grossEarnings !== undefined
        ? Number(data.grossEarnings)
        : Number(existingRecord.grossEarnings);

    const commRate =
      data.commissionRate !== undefined
        ? Number(data.commissionRate)
        : Number(existingRecord.commissionRate);

    // 3. AUTOMATIC RECALCULATION LOGIC
    // Baguhin ang formula sa ibaba batay sa totoong computation ng negosyo mo.
    // Halimbawa: Commission = Gross * (CommissionRate / 100) + Base/Current Salary
    let calculatedSalary =
      data.salary !== undefined ? Number(data.salary) : null;

    if (calculatedSalary === null) {
      const commissionAmount = gross * (commRate / 100);

      // Kung ang salary ay ang dating base salary + commission:
      // Pwede mong baguhin ang formula rito, halimbawa: gross + commissionAmount
      calculatedSalary = Number(existingRecord.salary) + commissionAmount;
    }

    // 4. I-update ang record sa Prisma
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

  // 5. SOFT DELETE SALARY RECORD
  public static async softDeleteRecord(id: string) {
    return await prisma.salaryRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

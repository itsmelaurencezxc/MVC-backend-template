import { Prisma } from "@prisma/client";
import prisma from "../utils/client";
import { fetchDiscordProfile } from "../config/services/DiscordService";

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

    const totalSalary = records.reduce(
      (acc, curr) => acc + Number(curr.salary || 0),
      0,
    );

    // Net/Final earnings ng shop (Total Gross - Total Pinasahod)
    const totalFinalEarnings = totalGross - totalSalary;

    return {
      payoutPeriodId,
      totalGross,
      totalSalary,
      totalFinalEarnings, // <--- Kabuuang natira sa shop matapos ibawas ang sahod
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

  //get all time earnings
  public static async getAllTimeEmployeeEarnings() {
    // 1. I-group ang lahat ng records per employeeId at i-sum ang earnings
    const summary = await prisma.salaryRecord.groupBy({
      by: ["employeeId"],
      where: { deletedAt: null },
      _sum: {
        grossEarnings: true,
        salary: true,
      },
      _count: {
        id: true, // Bilang ng linggo/payout periods na pumasok sila
      },
    });

    // 2. Kunin ang mga pangalan ng employees mula sa Employee table
    const employeeIds = summary.map((item) => item.employeeId);
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
    });

    // 3. Pagsama-samahin ang data para maging malinis ang lumabas sa response
    const result = summary.map((item) => {
      const emp = employees.find((e) => e.id === item.employeeId);
      const totalGross = Number(item._sum.grossEarnings || 0);
      const totalSalary = Number(item._sum.salary || 0);

      return {
        employeeId: item.employeeId,
        name: emp ? emp.name : "Unknown",
        totalPayoutsCount: item._count.id, // Ilang beses sumahod/nag-record
        totalGrossEarnings: totalGross,
        totalSalaryEarned: totalSalary,
        totalFinalEarnings: totalGross - totalSalary, // Net earnings ng shop mula sa mekanikong ito
      };
    });

    // 4. (Optional) Pwedeng i-sort base sa pinakamalaking total gross o total salary (Leaderboard style)
    return result.sort((a, b) => b.totalGrossEarnings - a.totalGrossEarnings);
  }

  //all time earning ng mechshop
  // Kunin ang pangkalahatang total (overall gross at salary) ng buong shop sa lahat ng payout periods
  public static async getOverallShopEarnings() {
    // Kunin ang aggregate sum ng lahat ng records
    const aggregation = await prisma.salaryRecord.aggregate({
      where: { deletedAt: null },
      _sum: {
        grossEarnings: true,
        salary: true,
      },
      _count: {
        id: true, // Bilang ng total records / entries ng lahat ng mechanics sa lahat ng linggo
      },
    });

    const totalGross = Number(aggregation._sum.grossEarnings || 0);
    const totalSalary = Number(aggregation._sum.salary || 0);
    const totalNetShopRevenue = totalGross - totalSalary; // Kit ng shop pagkatapos ibawas ang commission ng mechanics

    return {
      totalRecordsCount: aggregation._count.id,
      overallGrossEarnings: totalGross, // Kabuuang benta ng shop
      overallMechanicSalary: totalSalary, // Kabuuang bayad sa mga mekaniko
      overallShopRevenue: totalNetShopRevenue, // Net kita ng shop
    };
  }

  //detailed emp weekly
  public static async getEmployeeModalDetails(
    employeeId: string,
    payoutPeriodIds: string[],
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        salaryRecords: {
          where: {
            payoutPeriodId: { in: payoutPeriodIds },
            deletedAt: null,
          },
          include: {
            payoutPeriod: {
              select: {
                id: true,
                period: true,
                startDate: true,
                endDate: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!employee || employee.deletedAt) {
      throw new Error("Employee not found");
    }

    // DITO NATIN KUKUNIN ANG LIVE DISCORD PROFILE (MODAL)
    let discordData = { username: "N/A", avatar: "", banner: "" };
    if (employee.discordId) {
      const profile = await fetchDiscordProfile(employee.discordId);
      if (profile) discordData = profile;
    }

    const totalGross = employee.salaryRecords.reduce(
      (acc, curr) => acc + Number(curr.grossEarnings || 0),
      0,
    );
    const totalSalary = employee.salaryRecords.reduce(
      (acc, curr) => acc + Number(curr.salary || 0),
      0,
    );

    return {
      id: employee.id,
      name: employee.name,
      discord: discordData, // Live Discord data na ang gagamitin dito!
      summary: {
        totalGrossEarnings: totalGross,
        totalSalaryEarned: totalSalary,
      },
      weeklyBreakdown: employee.salaryRecords.map((record) => ({
        payoutPeriodId: record.payoutPeriodId,
        periodName: record.payoutPeriod?.period || "Unknown Period",
        grossEarnings: Number(record.grossEarnings),
        commissionRate: Number(record.commissionRate),
        salary: Number(record.salary),
        recmats: record.recmats,
        isClaimed: record.isClaimed,
      })),
    };
  }

  // Kunin ang leaderboard list para sa kahit anong bilang ng payout periods (flexi 1 to 4+ periods)
  public static async getPublicMonthlyLeaderboardList(
    payoutPeriodIds: string[],
  ) {
    const records = await prisma.salaryRecord.findMany({
      where: {
        payoutPeriodId: { in: payoutPeriodIds },
        deletedAt: null,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            discordId: true,
            // Hindi na natin masyadong kailangan ang discordAvatar/Banner sa DB dahil live na nating hihilain
          },
        },
      },
    });

    const summaryMap: {
      [key: string]: {
        employee: any;
        discord: any;
        totalGross: number;
        totalSalary: number;
      };
    } = {};

    for (const record of records) {
      if (!record.employee) continue;
      const empId = record.employee.id;

      if (!summaryMap[empId]) {
        // DITO NATIN KUKUNIN ANG LIVE DISCORD PROFILE (LEADERBOARD)
        let discordData = { username: "N/A", avatar: "", banner: "" };
        if (record.employee.discordId) {
          const profile = await fetchDiscordProfile(record.employee.discordId);
          if (profile) discordData = profile;
        }

        summaryMap[empId] = {
          employee: record.employee,
          discord: discordData, // Live Discord data na rin dito!
          totalGross: 0,
          totalSalary: 0,
        };
      }
      summaryMap[empId].totalGross += Number(record.grossEarnings || 0);
      summaryMap[empId].totalSalary += Number(record.salary || 0);
    }

    const leaderboard = Object.values(summaryMap).map((item) => ({
      employeeId: item.employee.id,
      name: item.employee.name,
      discord: item.discord, // Awtomatikong isasama ang live avatar, banner, at username!
      totalGrossEarnings: item.totalGross,
      totalSalaryEarned: item.totalSalary,
    }));

    return leaderboard.sort(
      (a, b) => b.totalGrossEarnings - a.totalGrossEarnings,
    );
  }
}

import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import { SalaryRecordAction } from "../../business/SalaryRecordAction";

export class SalaryRecordController {
  async getAll(req: Request, res: Response) {
    try {
      const records = await SalaryRecordAction.getAllRecords();
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: records || [],
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 500,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }

  async getByPeriod(req: Request, res: Response) {
    const { payoutPeriodId } = req.params;

    if (!payoutPeriodId) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Payout period ID parameter is required",
      });
    }

    try {
      const data = await SalaryRecordAction.getByPeriod(payoutPeriodId);
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data,
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 500,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }

  async create(req: Request, res: Response) {
    const {
      employeeId,
      payoutPeriodId,
      grossEarnings,
      commissionRate,
      recmats,
    } = req.body;

    if (!employeeId || !payoutPeriodId) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Both employeeId and payoutPeriodId are required",
      });
    }

    try {
      const newRecord = await SalaryRecordAction.createRecord({
        employeeId,
        payoutPeriodId,
        grossEarnings: grossEarnings ?? 0,
        commissionRate: commissionRate ?? 0,
        recmats,
      });

      return AppResponse.sendSuccess({
        res,
        code: 201,
        data: newRecord,
        message: "Salary record created successfully",
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 500,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;

    const { grossEarnings, commissionRate, recmats, isClaimed } = req.body;

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Salary Record ID is required",
      });
    }

    try {
      const updatedRecord = await SalaryRecordAction.updateRecord(id, {
        grossEarnings,
        commissionRate,
        recmats,
        isClaimed,
      });

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: updatedRecord,
        message: "Salary record updated successfully",
      });
    } catch (error: any) {
      const code = error.code === "P2025" ? 404 : 500;
      return AppResponse.sendErrors({
        res,
        code,
        data: null,
        message:
          error.code === "P2025" ? "Salary record not found" : error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Salary Record ID is required",
      });
    }

    try {
      await SalaryRecordAction.softDeleteRecord(id);

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: { message: "Salary record archived successfully" },
      });
    } catch (error: any) {
      const code = error.code === "P2025" ? 404 : 500;
      return AppResponse.sendErrors({
        res,
        code,
        data: null,
        message:
          error.code === "P2025" ? "Salary record not found" : error.message,
      });
    }
  }

  //gett all time earnings heree employee
  async getAllTimeEarnings(req: Request, res: Response) {
    try {
      const summary = await SalaryRecordAction.getAllTimeEmployeeEarnings();
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: summary,
        message: "All-time employee earnings retrieved successfully",
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 500,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }

  //all time earning ng mechanic shop
  async getOverallEarnings(req: Request, res: Response) {
    try {
      const summary = await SalaryRecordAction.getOverallShopEarnings();
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: summary,
        message: "Overall shop earnings retrieved successfully",
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 500,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }

  //contolerrrrr employee
  async getEmployeeModalDetails(req: Request, res: Response) {
    const { employeeId } = req.params;
    const { periods } = req.query; // Payout period IDs separated by comma

    if (!employeeId) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Employee ID is required",
      });
    }

    if (!periods || typeof periods !== "string") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message:
          "Payout periods parameter (?periods=id1,id2,id3,id4) is required",
      });
    }

    const payoutPeriodIds = periods.split(",");

    try {
      const details = await SalaryRecordAction.getEmployeeModalDetails(
        employeeId,
        payoutPeriodIds,
      );
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: details,
        message: "Employee modal details retrieved successfully",
      });
    } catch (error: any) {
      const code = error.message === "Employee not found" ? 404 : 500;
      return AppResponse.sendErrors({
        res,
        code,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }

  //monthly records
  async getPublicMonthlyLeaderboardList(req: Request, res: Response) {
    const { periods } = req.query; // Payout period IDs separated by comma (e.g. ?periods=id1 o id1,id2,id3,id4)

    if (!periods || typeof periods !== "string") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message:
          "Please provide payout period ID(s) separated by comma (e.g. ?periods=id1,id2)",
      });
    }

    const payoutPeriodIds = periods.split(",");

    try {
      const leaderboard =
        await SalaryRecordAction.getPublicMonthlyLeaderboardList(
          payoutPeriodIds,
        );
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: leaderboard,
        message: "Public leaderboard list retrieved successfully",
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 500,
        data: null,
        message: error.message || "Internal server error",
      });
    }
  }
}

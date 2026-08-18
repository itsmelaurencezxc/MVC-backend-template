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
      salary,
      recmats,
      isClaimed,
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
        salary: salary ?? 0,
        recmats,
        isClaimed,
      });

      return AppResponse.sendSuccess({
        res,
        code: 201,
        data: newRecord,
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
    const { grossEarnings, commissionRate, salary, recmats, isClaimed } =
      req.body;

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
        salary,
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
}

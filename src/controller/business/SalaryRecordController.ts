import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse"; // Adjust path
import { SalaryRecordAction } from "../../business/SalaryRecordAction";

export class SalaryRecordController {
  async getByPeriod(req: Request, res: Response) {
    const { payoutPeriodId } = req.params;

    if (!payoutPeriodId) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Payout Period ID parameter is required",
      });
    }

    try {
      const result =
        await SalaryRecordAction.getPeriodRecordsWithSummary(payoutPeriodId);

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: result,
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
      name,
      grossEarnings,
      commissionRate,
      recmats,
      isClaimed,
      payoutPeriodId,
    } = req.body;

    // 1. ERROR CHECKS: Field Validation
    if (!name || name.trim() === "") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Name is required",
      });
    }

    if (grossEarnings === undefined || Number(grossEarnings) < 0) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Gross earnings must be a valid positive number",
      });
    }

    if (commissionRate === undefined || Number(commissionRate) < 0) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Commission rate percentage is required",
      });
    }

    if (!payoutPeriodId) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Payout Period ID is required",
      });
    }

    try {
      const record = await SalaryRecordAction.create({
        name: name.trim(),
        grossEarnings: Number(grossEarnings),
        commissionRate: Number(commissionRate),
        recmats,
        isClaimed: Boolean(isClaimed),
        payoutPeriodId,
      });

      return AppResponse.sendSuccess({
        res,
        code: 201,
        data: record,
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

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Record ID parameter is required",
      });
    }

    try {
      const updatedRecord = await SalaryRecordAction.update(id, req.body);

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: updatedRecord,
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

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    // 1. ERROR CHECK: Param validation
    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Record ID parameter is required",
      });
    }

    try {
      await SalaryRecordAction.softDelete(id);

      // 2. SUCCESS RETURN
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: { message: "Record soft-deleted successfully" },
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

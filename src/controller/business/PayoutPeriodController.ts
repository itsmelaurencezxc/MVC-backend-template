import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import { PayoutPeriodAction } from "../../business/PayoutPeriodAction";

export class PayoutPeriodController {
  async getAll(req: Request, res: Response) {
    try {
      const periods = await PayoutPeriodAction.getAllPeriods();
      if (!periods || periods.length === 0) {
        return AppResponse.sendSuccess({
          res,
          code: 200,
          data: [],
          message: "No payout periods found",
        });
      }
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: periods,
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
    const { period } = req.body;

    if (!period || typeof period !== "string" || period.trim() === "") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Period name is required and must be a valid string",
      });
    }
    try {
      const newPeriod = await PayoutPeriodAction.createPeriod(period.trim());
      return AppResponse.sendSuccess({
        res,
        code: 201,
        data: newPeriod,
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

  // 👈 ITO ANG BAGO: UPDATE METHOD
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { period } = req.body;

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Period ID is required",
      });
    }

    if (!period || typeof period !== "string" || period.trim() === "") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Period name is required and must be a valid string",
      });
    }

    try {
      const updatedPeriod = await PayoutPeriodAction.updatePeriod(
        id,
        period.trim(),
      );
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: updatedPeriod,
        message: "Payout period updated successfully",
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

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Period ID is required",
      });
    }

    try {
      await PayoutPeriodAction.softDeletePeriod(id);

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: { message: "Payout period archived successfully" },
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

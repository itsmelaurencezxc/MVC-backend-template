import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import { PayoutPeriodAction } from "../../business/PayoutPeriodAction";

export class PayoutPeriodController {
  async getAll(req: Request, res: Response) {
    try {
      const periods = await PayoutPeriodAction.getAllPeriods();
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: periods || [],
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

  async getById(req: Request, res: Response) {
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
      const period = await PayoutPeriodAction.getPeriodById(id);

      if (!period) {
        return AppResponse.sendErrors({
          res,
          code: 404,
          data: null,
          message: "Payout period not found",
        });
      }

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: period,
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
    const { period, startDate, endDate } = req.body;

    if (!period || typeof period !== "string" || period.trim() === "") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Period name is required and must be a valid string",
      });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Start date and end date must be valid date strings",
      });
    }

    if (start > end) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Start date cannot be later than end date",
      });
    }

    try {
      const newPeriod = await PayoutPeriodAction.createPeriod({
        period: period.trim(),
        startDate,
        endDate,
      });

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

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { period, startDate, endDate, isCurrent } = req.body;

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Period ID is required",
      });
    }

    try {
      const updatedPeriod = await PayoutPeriodAction.updatePeriod(id, {
        ...(period && { period: period.trim() }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(isCurrent !== undefined && { isCurrent }),
      });

      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: updatedPeriod,
        message: "Payout period updated successfully",
      });
    } catch (error: any) {
      const code = error.code === "P2025" ? 404 : 500;
      const message =
        error.code === "P2025"
          ? "Payout period not found"
          : error.message || "Internal server error";

      return AppResponse.sendErrors({
        res,
        code,
        data: null,
        message,
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
      const code = error.code === "P2025" ? 404 : 500;
      const message =
        error.code === "P2025"
          ? "Payout period not found"
          : error.message || "Internal server error";

      return AppResponse.sendErrors({
        res,
        code,
        data: null,
        message,
      });
    }
  }
}

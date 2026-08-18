import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import { EmployeeAction } from "../../business/EmployeeAction";

export class EmployeeController {
  async getAll(req: Request, res: Response) {
    try {
      const employees = await EmployeeAction.getAll();
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: employees,
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
        message: "Employee ID parameter is required",
      });
    }

    try {
      const employee = await EmployeeAction.getById(id);
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: employee,
      });
    } catch (error: any) {
      return AppResponse.sendErrors({
        res,
        code: 404,
        data: null,
        message: error.message || "Employee not found",
      });
    }
  }

  async create(req: Request, res: Response) {
    // Kunin din ang discordId galing sa request body
    const { name, discordId } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Employee name is required",
      });
    }

    try {
      // Ipasa ang pangalan at discordId (kung meron man)
      const employee = await EmployeeAction.create(name, discordId);
      return AppResponse.sendSuccess({
        res,
        code: 201,
        data: employee,
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
    // Kunin din ang discordId para ma-update sakaling magbago
    const { name, discordId } = req.body;

    if (!id) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Employee ID parameter is required",
      });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: "Employee name is required",
      });
    }

    try {
      const updatedEmployee = await EmployeeAction.update(id, name, discordId);
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: updatedEmployee,
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
        message: "Employee ID parameter is required",
      });
    }

    try {
      await EmployeeAction.softDelete(id);
      return AppResponse.sendSuccess({
        res,
        code: 200,
        data: { message: "Employee archived successfully" },
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

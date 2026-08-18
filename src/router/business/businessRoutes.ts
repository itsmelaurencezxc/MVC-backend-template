import express from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import { PayoutPeriodController } from "../../controller/business/PayoutPeriodController";
import { SalaryRecordController } from "../../controller/business/SalaryRecordController";

const businessRoutes = express.Router();

const payoutPeriodController = new PayoutPeriodController();
const salaryRecordController = new SalaryRecordController();

businessRoutes.get("/payout-period/get-all", payoutPeriodController.getAll);

// Get by ID
businessRoutes.get("/payout-period/get/:id", payoutPeriodController.getById);

// Create
businessRoutes.post(
  "/payout-period/create",
  AuthMiddleware.verifyAdminToken,
  payoutPeriodController.create,
);

// Update
businessRoutes.patch(
  "/payout-period/update/:id",
  AuthMiddleware.verifyAdminToken,
  payoutPeriodController.update,
);

// Delete
businessRoutes.delete(
  "/payout-period/delete/:id",
  AuthMiddleware.verifyAdminToken,
  payoutPeriodController.delete,
);

businessRoutes.get("/salary-record/get-all", salaryRecordController.getAll);

businessRoutes.get(
  "/salary-record/get-by-period/:payoutPeriodId",
  salaryRecordController.getByPeriod,
);

businessRoutes.post(
  "/salary-record/create",
  AuthMiddleware.verifyAdminToken,
  salaryRecordController.create,
);

businessRoutes.patch(
  "/salary-record/update/:id",
  AuthMiddleware.verifyAdminToken,
  salaryRecordController.update,
);

businessRoutes.delete(
  "/salary-record/delete/:id",
  AuthMiddleware.verifyAdminToken,
  salaryRecordController.delete,
);

export default businessRoutes;

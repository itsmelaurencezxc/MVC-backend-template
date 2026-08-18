import express from "express";

import AuthMiddleware from "../../middleware/AuthMiddleware";
import { PayoutPeriodController } from "../../controller/business/PayoutPeriodController";
import { SalaryRecordController } from "../../controller/business/SalaryRecordController";

const businessRoutes = express.Router();

const payoutPeriodController = new PayoutPeriodController();
const salaryRecordController = new SalaryRecordController();

businessRoutes.get("/payout-period", payoutPeriodController.getAll);

businessRoutes.post(
  "/payout-period",
  AuthMiddleware.verifyAdminToken,
  payoutPeriodController.create,
);

businessRoutes.patch(
  "/payout-period/:id",
  AuthMiddleware.verifyAdminToken,
  payoutPeriodController.update,
);

businessRoutes.delete(
  "/payout-period/:id",
  AuthMiddleware.verifyAdminToken,
  payoutPeriodController.delete,
);
businessRoutes.get("/salary-record", salaryRecordController.getAll);
businessRoutes.get(
  "/salary-record/:payoutPeriodId",
  salaryRecordController.getByPeriod,
);

businessRoutes.post(
  "/salary-record",
  AuthMiddleware.verifyAdminToken,
  salaryRecordController.create,
);

businessRoutes.patch(
  "/salary-record/:id",
  AuthMiddleware.verifyAdminToken,
  salaryRecordController.update,
);

businessRoutes.delete(
  "/salary-record/:id",
  AuthMiddleware.verifyAdminToken,
  salaryRecordController.delete,
);

export default businessRoutes;

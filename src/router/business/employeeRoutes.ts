import express from "express";
import AuthMiddleware from "../../middleware/AuthMiddleware";
import { EmployeeController } from "../../controller/business/EmployeeController";

const employeeRoutes = express.Router();
const controller = new EmployeeController();

employeeRoutes.use(AuthMiddleware.verifyAdminToken);

employeeRoutes.get("/", controller.getAll);
employeeRoutes.get("/:id", controller.getById);
employeeRoutes.post("/create", controller.create);
employeeRoutes.put("/update/:id", controller.update);
employeeRoutes.delete("/delete/:id", controller.delete);

export default employeeRoutes;

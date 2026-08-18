import express from "express";
import testRouter from "./Test";
import userRoutes from "../router/user/UserRegistrationRoutes";
import businessRoutes from "./business/businessRoutes";

const routes = express.Router();
routes.use("/", testRouter);

routes.use("/user", userRoutes);
routes.use("/business", businessRoutes);

export default routes;

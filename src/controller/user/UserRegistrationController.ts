import { Request, Response } from "express";
import UserRegistrationAction from "../../action/user/UserRegistration";
import AppResponse from "../../utils/AppResponse";

class UserRegistrationController {
  async create(req: Request, res: Response) {
    const { error, value } = UserRegistrationAction.validate(req.body);

    if (error) {
      return AppResponse.sendErrors({
        res,
        code: 400,
        data: null,
        message: error.details.map((detail) => detail.message).join(", "),
      });
    }

    try {
      const invalidEmail = await UserRegistrationAction.checkEmail(
        value.userEmail,
      );

      if (invalidEmail) {
        return AppResponse.sendErrors({
          res,
          message: "Email is already in use",
          data: null,
          code: 409,
        });
      }

      const result = await UserRegistrationAction.execute(value);

      return AppResponse.sendSuccess({
        res,
        data: result,
        code: 201,
      });
    } catch (error) {
      return AppResponse.sendErrors({
        res,
        message: "Internal server error",
        data: null,
        code: 500,
      });
    }
  }
}

export default UserRegistrationController;

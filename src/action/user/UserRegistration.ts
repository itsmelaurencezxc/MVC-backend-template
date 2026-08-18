import { Response } from "express";
import prisma from "../../utils/client";
import Joi from "joi";
import bcrypt from "bcrypt";

type UserRegistrationProps = {
  userEmail: string;
  userPassword: string;
  confirmPassword?: string;
  userContact: string;
};

class UserRegistrationAction {
  static async execute(data: UserRegistrationProps, res: Response) {
    try {
      const password = bcrypt.hashSync(data.userPassword, 10);
      const registerUser = await prisma.user.create({
        data: {
          userContact: data.userContact,
          userEmail: data.userEmail,
          userPassword: password,
        },
      });
      return registerUser;
    } catch (error) {
      console.error("Error in user registration:", error);
      throw error;
    }
  }

  static validate(data: UserRegistrationProps) {
    const UserRegistrationSchema = Joi.object({
      userEmail: Joi.string().email().required(),
      userPassword: Joi.string().min(8).required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref("userPassword"))
        .required()
        .messages({
          "any.only": "Confirm password must match the password field",
        }),
      userContact: Joi.string()
        .pattern(/^(09|\+639)\d{9}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Invalid user contact number format (Use 09XXXXXXXXX or +639XXXXXXXXX)",
        }),
    });
    return UserRegistrationSchema.validate(data, { abortEarly: false });
  }

  static async checkEmail(email: UserRegistrationProps["userEmail"]) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          userEmail: email,
        },
      });
      return existingUser;
    } catch (error) {
      console.error("Error checking email:", error);
      throw error;
    }
  }
}

export default UserRegistrationAction;

import { Request, Response, NextFunction } from "express";
import AppResponse from "../utils/AppResponse";
import { validateToken } from "../utils/token";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

class AuthMiddleware {
  public static verifyAdminToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return AppResponse.sendErrors({
        res,
        code: 401,
        data: null,
        message: "Access denied. No bearer token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = validateToken(token);
      req.user = decoded;

      next();
    } catch (error: any) {
      console.error("JWT Verification Error:", error.message);
      return AppResponse.sendErrors({
        res,
        code: 403,
        data: null,
        message: "Invalid or expired token.",
      });
    }
  }
}

export default AuthMiddleware;

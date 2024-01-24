import { NextFunction, Response } from "express";
import { Unauthorized } from "../exception/unauthorized-error";
import "express-async-errors";
import { RequestCustom } from "../expressCustom/expressCustom";
import AuthErrorCode from "../constant/authErrorCode";
import Jwt from "../../utils/Jwt";

export const authMiddleware = async (
  req: RequestCustom,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    throw new Unauthorized({
      errorMessage: "Not found headers authorization",
      errorCode: AuthErrorCode.NOT_FOUND_ACCESS_TOKEN,
    });
  }
  const [_, token] = req.headers.authorization.split(" ");
  try {
    const payload = Jwt.verifyAccessToken(token);
    req.userInfo = payload;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Unauthorized({
        errorCode: "Access token expired",
        errorMessage: AuthErrorCode.EXPIRE_ACCESS_TOKEN,
      });
    }
    throw new Unauthorized({
      errorCode: "Access token expired",
      errorMessage: AuthErrorCode.INVALID_ACCESS_TOKEN,
    });
  }
};

import { NextFunction, Request, Response } from "express";
import { Unauthorized } from "../exception/unauthorized-error";
import "express-async-errors";
import { RequestCustom } from "../expressCustom/expressCustom";
import AuthErrorCode from "../constant/authErrorCode";
import Jwt from "../../utils/Jwt";
import userService from "../../lib/services/user.service";
export const resetTokenMiddleware =async (req: RequestCustom, res: Response, next: NextFunction)=>{
    if(!req.headers.authorization){
        throw new Unauthorized({errorCode: AuthErrorCode.NOT_FOUND_REFRESH_TOKEN, errorMessage: "Not found headers authorization"});
      }
      const [_, token] = req.headers.authorization.split(" ")
      try {
      const payload =  Jwt.verifyRefreshToken(token)
       req.userInfo = payload;
            next();
      }catch(error: any){
        if(error.name === "TokenExpiredError"){
          await userService.deleteByRefreshToken(token);
          throw new Unauthorized({errorCode:AuthErrorCode.EXPIRE_REFRESH_TOKEN, errorMessage: "Refresh token expired" })
        }
        throw new Unauthorized({errorCode:AuthErrorCode.INVALID_REFRESH_TOKEN, errorMessage: "Invalid access token" })
      }
  }
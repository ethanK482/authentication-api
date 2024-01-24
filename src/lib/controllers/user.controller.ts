import { NextFunction, Request, Response } from "express";
import userService from "../services/user.service";
import "express-async-errors";
import { UserAttrs } from "../../database/model/User";
import { validationResult } from "express-validator";
import { Hashing } from "../../utils/hashing";
import { sendEmail } from "../../utils/mail";
import { addMinutes, isAfter } from "date-fns";
import Jwt from "../../utils/Jwt";
import { RequestCustom, ResponseCustom, userInfo } from "../../common/expressCustom/expressCustom";
import { RequestValidationError } from "../../common/exception/request-validation-error";
import AuthErrorCode from "../../common/constant/authErrorCode";
import { BadRequestErr } from "../../common/exception/bad-request-error";
import { HttpStatusCode } from "../../common/constant/httpStatusCode";
import { Unauthorized } from "../../common/exception/unauthorized-error";
import { ServerInternalError } from "../../common/exception/server-internal-error";
import env from "../../utils/env";
interface UserDto extends UserAttrs {
  confirmPassword: string;
}
class UserController {
  async register(req: Request, res: ResponseCustom, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    try {
      const { firstName, lastName, email, password, confirmPassword, role } =
        req.body as UserDto;
      if (password !== confirmPassword)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.NOT_MATCH,
          errorMessage: "Password not match",
        });
      const userExists = await userService.findUserByEmail(email);
      if (userExists)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.EXISTS_USER,
          errorMessage: "User already exists",
        });
      const user = await userService.registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
      });
       sendEmail({
        email,
        subject: "Verify email",
        message: `Your verify token is ${user.verifyEmailToken} `,
      });
      return res.status(HttpStatusCode.CREATED).json({
        httpStatusCode: HttpStatusCode.CREATED,
        data: { email: user.email },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    try {
      const { verifyEmailToken } = req.body;
      await userService.findAndVerifyUser(verifyEmailToken);
      return res
        .status(HttpStatusCode.OK)
        .json({ message: "Verified successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async login(req: Request, res: ResponseCustom, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());

    try {
      const { email, password } = req.body as UserAttrs;
      const user = await userService.findUserByEmail(email);
      if (!user) {
        throw new Unauthorized({
          errorCode: AuthErrorCode.INVALID_EMAIL,
          errorMessage: "Not found any account with this email",
        });
      }
      const existsAuthToken = await userService.findAuthToken(user.id);
      if (existsAuthToken) {
        throw new BadRequestErr({
          errorCode: AuthErrorCode.DUPLICATE_LOGIN,
          errorMessage: "You already login",
        });
      }
      const isPasswordMatch = await Hashing.compare(user.password, password);
      if (!isPasswordMatch) {
        throw new Unauthorized({
          errorCode: AuthErrorCode.WRONG_PASSWORD,
          errorMessage: "Wrong password",
        });
      }
      const accessToken = Jwt.generateAccessToken(user);
      const refreshToken = Jwt.generateRefreshToken(user);

      const expiresIn = env.getAccessTokenExpireTime;
      await userService.createToken(user.id, accessToken, refreshToken);
      return res.json({
        httpStatusCode: HttpStatusCode.OK,
        data: {
          email: user.email,
          userId: user.id,
          token: { accessToken, refreshToken, expiresIn },
          fullName: `${user.firstName} ${user.lastName}`,
          role: user.role,
          isVerifyEmail: user.isVerifyEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async logOut(req: RequestCustom, res: ResponseCustom, next: NextFunction) {
    try {
      const info = req.userInfo;
      const existsAuthToken = await userService.findAuthToken(
        info?.userId as string
      );
      if (!existsAuthToken) {
        throw new Unauthorized({
          errorCode: AuthErrorCode.NOT_LOGIN,
          errorMessage: "You not login yet",
        });
      }
      const { acknowledged, deletedCount } = await userService.deleteAuthToken(
        req.userInfo?.userId as string
      );
      if (!deletedCount) {
        throw new ServerInternalError({
          errorCode: AuthErrorCode.SERVER_INTERNAL_ERROR,
          errorMessage: "Server internal error",
        });
      }
      return res.json({ httpStatusCode: HttpStatusCode.OK });
    } catch (error) {
      next(error);
    }
  }

  async getTokenResetPassword(
    req: Request,
    res: ResponseCustom,
    next: NextFunction
  ) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    try {
      const { email } = req.body;
      const userExists = await userService.findUserByEmail(email);
      if (!userExists)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.INVALID_EMAIL,
          errorMessage: "Not found any account with this email",
        });
      const { resetToken } = (await userService.createResetToken(
        email
      )) as UserAttrs;

       sendEmail({
        email,
        subject: "Reset password",
        message: `Your reset token is ${resetToken?.token} `,
      });
      return res.json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: ResponseCustom, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new RequestValidationError(errors.array());
    try {
      const { email, newPassword, confirmNewPassword, resetToken } = req.body;
      if (newPassword !== confirmNewPassword)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.NOT_MATCH,
          errorMessage: "Password not match",
        });
      const userExists = await userService.findUserByEmail(email);
      if (!userExists)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.INVALID_EMAIL,
          errorMessage: "Not found any account with this email",
        });
      if (!userExists.resetToken?.token)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.NOT_FOUND_RESET_PASSWORD_TOKEN,
          errorMessage: "You need to get reset token first",
        });
      if (resetToken !== userExists.resetToken?.token) {
        throw new BadRequestErr({
          errorCode: AuthErrorCode.INVALID_RESET_PASSWORD_TOKEN,
          errorMessage: "Your token invalid",
        });
      }
      const getAt = userExists.resetToken!.getAt;
      const expireTime = addMinutes(getAt, 2);
      if (isAfter(new Date(), expireTime))
        throw new BadRequestErr({
          errorCode: AuthErrorCode.RESET_PASSWORD_TOKEN_EXPIRED,
          errorMessage: "Your token expired",
        });
      await userService.changePassword(email, newPassword);
      await userService.deleteToken(email);
      return res.json({
        httpStatusCode: HttpStatusCode.OK,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetToken(
    req: RequestCustom,
    res: ResponseCustom,
    next: NextFunction
  ) {
    try {
      const { userId } = req.userInfo as userInfo;
      const existsAuthToken = await userService.findAuthToken(userId as string);
      if (!existsAuthToken) {
        throw new Unauthorized({
          errorCode: AuthErrorCode.NOT_LOGIN,
          errorMessage: "You need to login",
        });
      }
      const user = await userService.findUserById(userId);
      if (!user)
        throw new BadRequestErr({
          errorCode: AuthErrorCode.NOT_FOUND_USER,
          errorMessage: "Not found any account with this email",
        });
      const authToken = await userService.updateAuthToken(user);
      return res.json({
        httpStatusCode: HttpStatusCode.OK,
        data: {
          accessToken: authToken!.accessToken,
          expiresIn: env.getAccessTokenExpireTime,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();

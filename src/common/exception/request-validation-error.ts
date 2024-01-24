import { ValidationError } from "express-validator";
import { HttpStatusCode } from "../constant/httpStatusCode";
import { ErrorDetail } from "../expressCustom/expressCustom";
import { ErrorCustom } from "./ErrorCustom";
import AuthErrorCode from "../constant/authErrorCode";

export class RequestValidationError extends ErrorCustom {
  statusCode = HttpStatusCode.BAD_REQUEST;
  constructor(public errors: ValidationError[]) {
    const errorFormat = errors.map((error) => {
      return {
        errorCode: AuthErrorCode.FAILED_VALIDATE_BODY,
        errorMessage: error.msg,
      } as ErrorDetail;
    });
    super(errorFormat);
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeError() {
    return this.errors.map((error) => {
      return {
        errorCode: AuthErrorCode.FAILED_VALIDATE_BODY,
        errorMessage: error.msg,
      } as ErrorDetail;
    });
  }
}

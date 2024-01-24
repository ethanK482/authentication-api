
import { HttpStatusCode } from "../constant/httpStatusCode";
import { ErrorDetail } from "../expressCustom/expressCustom";
import { ErrorCustom } from "./ErrorCustom";

export class BadRequestErr extends ErrorCustom {
  statusCode = HttpStatusCode.BAD_REQUEST;
  constructor(private error: ErrorDetail) {
    super(error);
    Object.setPrototypeOf(this, BadRequestErr.prototype);
  }
  serializeError() {
    return {
      errorCode: this.error.errorCode,
      errorMessage: this.error.errorMessage,
    };
  }
}

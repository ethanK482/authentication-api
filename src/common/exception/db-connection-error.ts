import { HttpStatusCode } from "../constant/httpStatusCode";
import { ErrorDetail } from "../expressCustom/expressCustom";
import { ErrorCustom } from "./ErrorCustom";

export class DatabaseConnectionError extends ErrorCustom {
  statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  constructor(private error: ErrorDetail) {
    super(error);
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  serializeError() {
    return {
      errorCode: this.error.errorCode,
      errorMessage: this.error.errorMessage,
    };
  }
}

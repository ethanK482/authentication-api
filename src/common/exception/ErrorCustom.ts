import { ErrorDetail } from "../expressCustom/expressCustom";

export abstract class ErrorCustom extends Error {
  abstract statusCode: number;
  constructor(error: ErrorDetail | ErrorDetail[]) {
    super(JSON.stringify(error));
    Object.setPrototypeOf(this, ErrorCustom.prototype);
  }
  abstract serializeError(): ErrorDetail | ErrorDetail[];
}

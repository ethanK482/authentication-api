import mongoose from "mongoose";

import config from "../utils/env";
import { DatabaseConnectionError } from "../common/exception/db-connection-error";
import AuthErrorCode from "../common/constant/authErrorCode";

class dbConnection {
  async connect() {
    try {
      await mongoose.connect(
        `mongodb://${config.getHost}:${config.getDbPort}/auth`
      );
      console.log("Connected to MongoDB");
    } catch (error) {
      throw new DatabaseConnectionError({
        errorCode: AuthErrorCode.DATABASE_ERROR,
        errorMessage: `DB connection error ${error} `,
      });
    }
  }
}

export default new dbConnection();

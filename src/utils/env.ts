import dotenv from "dotenv";
dotenv.config();

class Env {
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }
  get portServer(): number {
    return Number(process.env.PORT)!;
  }
  get JWTSecretKey(): string {
    return process.env.JWT_SECRET_KEY!;
  }

  get JWTRefreshSecretKey(): string {
    return process.env.JWT_SECRET_REFRESH_KEY!;
  }

  get getHost(): string {
    return process.env.HOST!;
  }

  get getDbName(): string {
    return process.env.DB_NAME!;
  }

  get getDbPort(): number {
    return Number(process.env.DB_PORT!)
  }

  get getAccessTokenExpireTime(): string {
    return process.env.EXPIREACCESSIN!
  }
  get getRefreshTokenExpireTime(): string {
    return process.env.EXPIREREFRESHIN!
  }
}
export default new Env();

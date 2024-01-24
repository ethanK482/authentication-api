import jwt from "jsonwebtoken";
import { userDoc } from "../database/model/User";
import env from "./env";
import { userInfo } from "../common/expressCustom/expressCustom";
class JwtHandler {
  generateAccessToken(user: userDoc) {
    const userJwt = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      env.JWTSecretKey,
      { expiresIn: env.getAccessTokenExpireTime }
    );

    return userJwt;
  }

  verifyAccessToken(accessToken: string) {
   const payload =  jwt.verify(accessToken, env.JWTSecretKey);
   return payload as userInfo
  }
  generateRefreshToken(user: userDoc) {
    const userJwt = jwt.sign(
      {
        userId: user.id,
      },
      env.JWTRefreshSecretKey,
      { expiresIn: env.getRefreshTokenExpireTime }
    );

    return userJwt;
  }

  verifyRefreshToken(refreshToken: string) {
    const payload =  jwt.verify(refreshToken, env.JWTRefreshSecretKey);
    return payload as userInfo;
   }



}
export default new JwtHandler()
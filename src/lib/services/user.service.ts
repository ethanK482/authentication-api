import { Hashing } from "../../utils/hashing";
import { User, UserAttrs, userDoc } from "../../database/model/User";
import { randomBytes } from "crypto";
import { AuthToken } from "../../database/model/AuthToken";
import Jwt from "../../utils/Jwt";
import { BadRequestErr } from "../../common/exception/bad-request-error";
import AuthErrorCode from "../../common/constant/authErrorCode";
class UserService {
  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async findUserById(id: string) {
    return await User.findOne({ _id: id });
  }

  async findAndVerifyUser(verifyEmailToken: string) {
    const user = await User.findOne({ verifyEmailToken });
    if (!user)
      throw new BadRequestErr({
        errorCode: AuthErrorCode.INVALID_VERIFY_EMAIL_TOKEN,
        errorMessage: `Not found any user with token ${verifyEmailToken}`,
      });
    if (user.isVerifyEmail)
      throw new BadRequestErr({
        errorCode: AuthErrorCode.INVALID_VERIFY_EMAIL_TOKEN,
        errorMessage: "Email verify already",
      });
    if (user.verifyEmailToken !== verifyEmailToken) {
      throw new BadRequestErr({
        errorCode: AuthErrorCode.INVALID_VERIFY_EMAIL_TOKEN,
        errorMessage: "Invalid token",
      });
    }

    user.isVerifyEmail = true;
    user.updatedAt = new Date();
    return await user.save();
  }

  async registerUser(user: Omit<UserAttrs, "verifyEmailToken">) {
    const hashedPassword = await Hashing.toHash(user.password);
    const verifyEmailToken = randomBytes(8).toString("hex");
    const newUser = User.build({
      ...user,
      password: hashedPassword,
      verifyEmailToken,
    });
    await newUser.save();
    return newUser;
  }

  async createResetToken(email: string) {
    const token = randomBytes(8).toString("hex");
    const doc = await User.findOneAndUpdate(
      { email },
      { resetToken: { token, getAt: new Date() } },
      { new: true }
    );
    return doc;
  }

  async changePassword(email: string, newPassword: string) {
    const hashPassword = await Hashing.toHash(newPassword);
    const doc = await User.findOneAndUpdate(
      { email },
      { resetToken: undefined, password: hashPassword },
      { new: true }
    );

    return doc;
  }

  async deleteToken(email: string) {
    const doc = await User.findOneAndUpdate(
      { email },
      { resetToken: null },
      { new: true }
    );
    return doc;
  }

  async createToken(userId: string, accessToken: string, refreshToken: string) {
    const authToken = AuthToken.build({ userId, accessToken, refreshToken });
    await authToken.save();
    return authToken;
  }

  async findAuthToken(userId: string) {
    return await AuthToken.findOne({ userId });
  }
  async findRefreshAuthToken(refreshToken: string) {
    return await AuthToken.findOne({ refreshToken });
  }

  async deleteByRefreshToken(refreshToken: string) {
    return await AuthToken.deleteOne({ refreshToken });
  }
  async deleteAuthToken(userId: string) {
    return await AuthToken.deleteOne({ userId });
  }

  async updateAuthToken(user: userDoc) {
    const accessToken = Jwt.generateAccessToken(user);
    const token = await AuthToken.findOneAndUpdate(
      { userId: user.id },
      { accessToken, updatedAt: new Date() },
      { new: true }
    );
    return token;
  }
}

export default new UserService();

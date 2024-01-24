import mongoose from "mongoose";

const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    accessToken: { type: String, require: true },
    refreshToken: { type: String, require: true },
  },
  { timestamps: true }
);
export interface TokenAttrs{
  userId: string;
  accessToken: string;
  refreshToken: string;
}
authTokenSchema .statics.build = (attrs: TokenAttrs) => {
  return new AuthToken(attrs);
};
export interface tokenDoc extends mongoose.Document {
  userId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}
interface AuthTokenModel extends mongoose.Model<tokenDoc> {
  build(attrs:TokenAttrs): tokenDoc;
}

const AuthToken = mongoose.model<tokenDoc, AuthTokenModel>("AuthToken", authTokenSchema);
export { AuthToken}

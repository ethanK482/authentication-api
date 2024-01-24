import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    resetToken: {
      type: { token: String, getAt: Date },
    },
    verifyEmailToken:{
      type: String,
      require: true,
    },
    isVerifyEmail: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
export interface UserAttrs {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  resetToken?: { token: String; getAt: Date };
  verifyEmailToken: string;
  isVerifyEmail?: boolean;
}
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};
export interface userDoc extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  resetToken: { token: String; getAt: Date };
  verifyEmailToken: string;
  isVerifyEmail: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface UserModel extends mongoose.Model<userDoc> {
  build(attrs: UserAttrs): userDoc;
}

const User = mongoose.model<userDoc, UserModel>("User", userSchema);
export { User };

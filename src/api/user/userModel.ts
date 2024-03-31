import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Document, model, Schema } from 'mongoose';

import { env } from '@/common/utils/envConfig';

interface IUser extends Document {
  email: string;
  name: string;
  hashedPassword: string;
  refreshToken?: string;
  accessToken?: string;
}

interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
  toJSON(): IUser;
  generateTokens(): Promise<{ accessToken: string; refreshToken: string }>;
  removeTokens(): Promise<void>;
}

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  accessToken: {
    type: String,
  },
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({
  refreshToken: 1,
});
userSchema.index({
  accessToken: 1,
});

// hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('hashedPassword')) {
    const salt = await bcryptjs.genSalt(10);
    this.hashedPassword = await bcryptjs.hash(this.hashedPassword, salt);
  }
  next();
});

// ================= schema methods =================

// remove password and refresh token from user object
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.hashedPassword;
  delete user.refreshToken;
  delete user.accessToken;
  delete user.__v;
  user._id = user._id.toString();
  return user;
};

// compare password with hashed password
userSchema.methods.comparePassword = async function (password: string) {
  return await bcryptjs.compare(password, this.hashedPassword);
};

userSchema.methods.generateTokens = async function () {
  const accessToken = jwt.sign(this.toJSON(), env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign(this.toJSON(), env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRATION,
  });

  this.refreshToken = refreshToken;

  this.accessToken = accessToken;

  await this.save();

  return { accessToken, refreshToken };
};

export default model<IUser & IUserMethods>('User', userSchema);

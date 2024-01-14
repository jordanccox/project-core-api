import mongoose = require('mongoose');
import { hashPassword, comparePasswords } from '../security/secure';

const { Schema } = mongoose;

// Interfaces
interface IUser {
  name: string;
  email: string;
  hash: string;
  address: string;
  phone: string;
  role: string;
  title: string;
  salary: number;
  preferences: {
    otp: {
      type: boolean;
    };
  };
  _id: string;
}

interface IUserMethods {
  setPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true }, // encrypt
  hash: String,
  address: { type: String, required: true }, // encrypt
  phone: { type: String, required: true }, // encrypt
  role: { type: String, required: true }, // admin or user
  title: String,
  salary: Number, // encrypt
  preferences: {
    otp: { type: Boolean },
  },
});

UserSchema.methods.setPassword = async function (password: string) {
  const hash = await hashPassword(password, 10);
  return hash;
};

UserSchema.methods.validatePassword = async function (password: string) {
  const hash = this.hash as string;
  const authenticated = await comparePasswords(password, hash);
  return authenticated;
};

const User = mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;

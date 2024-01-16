import mongoose = require('mongoose');
import { hashPassword, comparePasswords } from '../security/secure';
import { UserModel, IUser, IUserMethods } from '../types/user.interface';

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true }, // encrypt
  hash: String,
  address: {
    streetAddress: String,
    address2: String,
    city: String,
    state: String,
    country: String, // two-letter iso code
    zipCode: String,
  }, // encrypt
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

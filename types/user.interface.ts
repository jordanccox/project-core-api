import mongoose = require('mongoose');

// Interfaces
interface IUser {
  name: string;
  email: string;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  hash: string;
  address: {
    streetAddress: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    country: string; // two-letter iso code
    zipCode: string | null;
  };
  phone: string;
  role: string;
  title: string;
  salary: number;
  preferences: {
    otp: {
      type: boolean;
    };
  } | null;
  _id: string;
}

interface IUserMethods {
  setPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

interface SignupCredentials {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: 'admin' | 'user';
  title: string | null;
  salary: number | null;
  preferences: {
    otp: boolean;
  } | null;
  streetAddress: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  country: string; // two-letter iso code
  zipCode: string | null;
}

export { UserModel, IUser, IUserMethods, SignupCredentials };

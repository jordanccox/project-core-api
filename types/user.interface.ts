export interface UserWithValidation {
  name: string;
  email: string;
  hash: string;
  address: string;
  phone: string;
  role: string;
  title: string;
  salary: number;
  preferences: {
    otp: { type: boolean; default: false; verificationMethod: string };
  };
  validatePassword(password: string): Promise<boolean>;
  _id: string;
}

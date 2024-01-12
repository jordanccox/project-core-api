import mongoose = require('mongoose');
import secure from '../security/secure';

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true }, // encrypt
  hash: String,
  address: { type: String, required: true }, // encrypt
  phone: { type: String, required: true }, // encrypt
  role: { type: String, required: true },
  title: String, // encrypt
  salary: Number, // encrypt
});

UserSchema.methods.setPassword = async function (password: string) {
  this.hash = await secure.hashPassword(password, 10);
};

UserSchema.methods.validatePassword = async function (password: string) {
  const hash = this.hash as string;
  const authenticated = await secure.comparePasswords(password, hash);
  return authenticated;
};

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;

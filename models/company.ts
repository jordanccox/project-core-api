import mongoose = require('mongoose');
import { CompanyModel, ICompany } from '../types/company.interface';

const { Schema } = mongoose;

const CompanySchema = new Schema({
  companyName: { type: String, unique: true, required: true },
  primaryAdmin: { type: String, unique: true, required: true }, // admin _id
  address: {
    streetAddress: String,
    address2: String,
    city: String,
    state: String,
    country: { type: String, required: true }, // two-letter iso code
    zipCode: String,
  }, // encrypt
  phone: String, // encrypt
});

const Company = mongoose.model<ICompany, CompanyModel>(
  'Company',
  CompanySchema,
);

export default Company;

import mongoose = require('mongoose');

// Interfaces
interface ICompany {
  companyName: string;
  primaryAdmin: string;
  address: {
    streetAddress: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    country: string; // two-letter iso code
    zipCode: string | null;
  };
  phone: string | null;
  _id: string;
}

interface CompanySignupCredentials {
  companyName: string;
  primaryAdmin: string;
  streetAddress: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  country: string; // two-letter iso code
  zipCode: string | null;
  phone: string | null;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type CompanyModel = mongoose.Model<ICompany>;

export { CompanyModel, ICompany, CompanySignupCredentials };

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

interface IUserInvitee {
  name: string;
  email: string;
  accepted: boolean; // boolean indicating if the user has accepted the invite and created an account associated with the company
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
  invitees: Array<IUserInvitee> | null;
  activeUsers: Array<string> | null; // array of ObjectIds pointing to user accounts associated with the company
}

// eslint-disable-next-line @typescript-eslint/ban-types
type CompanyModel = mongoose.Model<ICompany>;

export { CompanyModel, ICompany, CompanySignupCredentials };

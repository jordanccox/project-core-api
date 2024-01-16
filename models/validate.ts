import { Request } from 'express';
import joi = require('joi');
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';

import { SignupCredentials } from '../controllers/authentication';

/**
 * Validates user object submitted during signup
 * @param req Request object
 * @returns boolean
 */
const validateUserSignupSchema = (req: Request) => {
  const { phone, address } = req.body as SignupCredentials;

  const userSignupSchema = joi.object({
    email: joi.string().email().required(),
    name: joi.string().required(),
    password: joi
      .string()
      .pattern(
        // eslint-disable-next-line prettier/prettier
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ // Require at least 8 characters, and combinations of uppercase, lowercase, digits, and non-alphanumeric characters
      )
      .required(),
    phone: joi.string().required(),
    role:
      joi
        .string()
        .pattern(/^admin$/)
        .required() ||
      joi
        .string()
        .pattern(/^user$/)
        .required(),
    title: joi.string(),
    salary: joi.number(),
    preferences: joi.object({
      otp: joi.boolean(),
    }),
    address: joi.object({
      streetAddress: joi.string(),
      address2: joi.string(),
      city: joi.string(),
      state: joi.string(),
      country: joi
        .string()
        .length(2)
        .pattern(/[a-zA-Z]+/)
        .required(),
      zipCode: joi.string().pattern(/\b(?!00000)\d{5}(?:-\d{4})?\b/),
    }),
  });

  const isValidUser = userSignupSchema.validate(req.body);

  if (isValidUser.error) {
    console.log(isValidUser.error);
    return false;
  }

  return validatePhoneNumber(phone, address.country as CountryCode);
};

/**
 * Ensures phone number submitted in request is valid
 * @param phone Phone number from req.body.phone
 * @param countryCode Country code from req.body.address.country
 * @returns boolean
 */
const validatePhoneNumber = (phone: string, countryCode: CountryCode) => {
  const isValid = isValidPhoneNumber(phone, countryCode);

  if (!isValid) {
    return false;
  }

  return true;
};

export { validateUserSignupSchema };

// Test user
const exampleUser = {
  email: 'jordancox747@outlook.com',
  name: 'Jordan Cox',
  password: 'myPassword@123',
  phone: '+19708892840',
  role: 'admin',
  title: 'Business Manager',
  salary: '30',
  preferences: {
    otp: false,
  },
  address: {
    streetAddress: '4412 E Mulberry St',
    address2: 'Lot 286',
    state: 'CO',
    country: 'US',
    zipCode: '80524',
  },
};

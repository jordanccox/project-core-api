import { Request } from 'express';
import joi = require('joi');
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';

import { SignupCredentials } from '../types/user.interface';

/**
 * Validates user object submitted during signup
 * @param req Request object
 * @returns boolean
 */
const validateUserSignupSchema = (req: Request) => {
  const { phone, country } = req.body as SignupCredentials;

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
  });

  const isValidUser = userSignupSchema.validate(req.body);

  if (isValidUser.error) {
    console.log(isValidUser.error);
    return false;
  }

  return validatePhoneNumber(phone, country as CountryCode);
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

// validate company credentials
const validateCompanySchema = (req: Request) => {
  const companyCreationSchema = joi.object({
    companyName: joi.string().required(),
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
    phone: joi.string(),
    invitees: joi.array(),
    activeUsers: joi.array(),
  });

  const isValidCompany = companyCreationSchema.validate(req.body);

  if (isValidCompany.error) {
    console.log(isValidCompany.error);
    return false;
  }

  return true;
};

export { validateUserSignupSchema, validateCompanySchema };

import { Request } from 'express';
import joi = require('joi');
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';

import { SignupCredentials } from '../controllers/authentication';

const validateUserSignupSchema = (req: Request) => {
  const { phone, address } = req.body as SignupCredentials;

  const userSignupSchema = joi.object({
    email: joi.string().email().required(),
    name: joi.string().required(),
    password: joi
      .string()
      .pattern(
        // eslint-disable-next-line prettier/prettier
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
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
      otp: joi.string(),
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

  if (!isValidUser) {
    return false;
  }

  const isValidNumber = isValidPhoneNumber(
    phone,
    address.country as CountryCode,
  );

  if (!isValidNumber) {
    return false;
  }

  return true;
};

import { NextFunction, Request, Response } from 'express';
import _ = require('lodash');

import Company from '../models/company';
import { validateCompanySchema } from '../models/validate';
import { CompanySignupCredentials } from '../types/company.interface';

// must be logged in to access this route
const companyCreation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validCredentials = validateCompanySchema(req);

  if (!validCredentials) {
    return res.status(422).json({
      responseCode: res.statusCode,
      responseBody:
        'Unable to process company credentials. Ensure credentials are entered correctly before trying again.',
    });
  }

  const { companyName } = req.body as CompanySignupCredentials;

  try {
    const existingCompany = await Company.find({ companyName });

    if (!_.isEmpty(existingCompany)) {
      return res.status(422).json({
        responseCode: res.statusCode,
        responseBody: 'Company name is already in use.',
      });
    }

    const credentials = req.body as CompanySignupCredentials;

    const company = new Company({
      companyName: credentials.companyName,
      primaryAdmin: credentials.primaryAdmin,
    });
  } catch (err) {
    next(err);
  }
};

// once initial admin has signed up, they can create a company profile

// edit company profile

// change roles for company profile (who is an admin / user)

// invite team members

// delete company

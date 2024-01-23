import { NextFunction, Request, Response } from 'express';
import _ = require('lodash');

import Company from '../models/company';
import User from '../models/user';
import { validateCompanySchema } from '../models/validate';
import { CompanySignupCredentials } from '../types/company.interface';

// must be logged in to access this route
const companyCreation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseMessage: 'Unauthorized' });
  }

  const user = await User.findOne({ _id: req.session.user.id as string });

  if (!user) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseMessage: 'Unauthorized' });
  }

  if (user.role !== 'admin') {
    return res
      .status(403)
      .json({ responseCode: res.statusCode, responseMessage: 'Forbidden' });
  }

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
      primaryAdmin: user._id,
      address: {
        streetAddress: credentials.streetAddress,
        address2: credentials.address2,
        city: credentials.city,
        state: credentials.state,
        country: credentials.country,
        zipCode: credentials.zipCode,
      },
      phone: credentials.phone,
      invitees: credentials.invitees,
      activeUsers: [user._id],
    });

    await company.save();

    return res.status(200).json({
      responseCode: res.statusCode,
      responseBody: 'Company created successfully.',
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

export { companyCreation };

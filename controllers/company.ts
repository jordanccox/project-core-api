import { NextFunction, Request, Response } from 'express';
import _ = require('lodash');

import Company from '../models/company';
import User from '../models/user';
import {
  validateCompanySchema,
  validateTeamMemberInvite,
} from '../models/validate';
import { CompanySignupCredentials } from '../types/company.interface';

/**
 * Create a new company. The user to create the company must be an admin.
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response
 */
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

  try {
    const user = await User.findOne({ _id: req.session.user.id as string });
    if (!user) {
      return res.status(401).json({
        responseCode: res.statusCode,
        responseMessage: 'Unauthorized',
      });
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

// invite team members
const inviteTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseMessage: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({ _id: req.session.user.id as string });

    if (!user) {
      return res.status(401).json({
        responseCode: res.statusCode,
        responseMessage: 'Unauthorized',
      });
    }

    if (user.role !== 'admin') {
      return res
        .status(403)
        .json({ responseCode: res.statusCode, responseMessage: 'Forbidden' });
    }

    const validInvite = validateTeamMemberInvite(req);

    if (!validInvite) {
      return res.status(422).json({
        responseCode: res.statusCode,
        responseBody:
          'Unable to process invite. Ensure invite fields are entered correctly before trying again.',
      });
    }
  } catch (err) {
    next(err);
  }
};

// edit company profile

// change roles for company profile (who is an admin / user)

// delete company

export { companyCreation };

import { NextFunction, Request, Response } from 'express';
import _ = require('lodash');
import User from '../models/user';
import Company from '../models/company';
import {
  sendEmailOtp,
  sendOtp,
  verifyEmailOtp,
  verifyOtp,
} from '../services/twilio';
import { validateUserSignupSchema } from '../models/validate';
import { SignupCredentials } from '../types/user.interface';
import { ICompany } from '../types/company.interface';

/**
 * Logs user in to an existing account. If user has otp set to true, an otp will be sent via sms and the user will have to submit the otp code to log in
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns res
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }

    const validPassword = await user.validatePassword(password);

    if (!validPassword || !user.emailConfirmed) {
      // Ensure that the user confirms their email through the user/first-login route before they can use this login
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }

    // Check if OTP is enabled
    if (user.preferences?.otp) {
      const otpStatus = await sendOtp(user.phone);

      if (otpStatus) {
        return res.status(200).json({
          responseCode: res.statusCode,
          responseBody: 'OTP pending verification',
        });
      }

      return res.status(500).json({
        responseCode: res.statusCode,
        responseBody: 'Internal server error',
      });
    }

    req.session.regenerate((err: any) => {
      if (err) next(err);

      req.session.user = { id: user._id, name: user.name };

      req.session.save((error: any) => {
        if (error) return next(error);
        return res
          .status(200)
          .json({ responseCode: res.statusCode, responseBody: user });
      });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * OTP verification to log in
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns res
 */
const loginOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { otpCode, email } = req.body as { otpCode: string; email: string };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }

    const verified = await verifyOtp(user.phone, otpCode);

    if (verified === 'approved') {
      req.session.regenerate((err: any) => {
        if (err) next(err);

        req.session.user = { id: user._id, name: user.name };

        req.session.save((error: any) => {
          if (error) return next(error);
          return res
            .status(200)
            .json({ responseCode: res.statusCode, responseBody: user });
        });
      });
    } else {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * End a user session
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
const logout = (req: Request, res: Response, next: NextFunction) => {
  req.session.user = null;
  req.session.save((error: any) => {
    if (error) next(error);

    req.session.regenerate((err: any) => {
      if (err) next(err);

      return res.status(200).json({
        responseCode: res.statusCode,
        responseBody: 'User logged out successfully',
      });
    });
  });
};

/**
 * Sign up for first admin of a company account. Any further sign ups for the same company must be invited by the initial admin
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response
 */
const adminSignup = async (req: Request, res: Response, next: NextFunction) => {
  const validCredentials = validateUserSignupSchema(req);

  if (!validCredentials) {
    return res.status(422).json({
      responseCode: res.statusCode,
      responseBody:
        'Unable to process user credentials. Ensure credentials are entered correctly before trying again.',
    });
  }

  const { phone, email } = req.body as SignupCredentials;

  try {
    const existingUser = await User.find({
      $or: [{ email }, { phone }],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (!_.isEmpty(existingUser)) {
      return res.status(422).json({
        responseCode: res.statusCode,
        responseBody: 'Email or phone number is already in use.',
      });
    }

    const credentials = req.body as SignupCredentials;

    const user = new User({
      name: credentials.name,
      email: credentials.email,
      emailConfirmed: false, // need to confirm on first login
      phoneConfirmed: false,
      address: {
        streetAddress: credentials.streetAddress,
        address2: credentials.address2,
        city: credentials.city,
        state: credentials.state,
        country: credentials.country,
        zipCode: credentials.zipCode,
      },
      phone: credentials.phone,
      role: credentials.role,
      title: credentials.title,
      salary: credentials.salary,
      preferences: {
        otp: credentials.preferences?.otp, // don't allow otp preference to be set until user confirms phone number
      },
      company: null,
    });

    user.hash = await user.setPassword(credentials.password);
    await user.save();
    const otpStatus = await sendEmailOtp(user.email);

    if (otpStatus) {
      return res.status(200).json({
        responseCode: res.statusCode,
        responseBody: 'Email pending verification',
      });
    }

    return res.status(500).json({
      responseCode: res.statusCode,
      responseBody: 'Internal server error',
    });
    // send OTP via email (need to write email otp function)
    // confirm email to finish setting up account -- after they set up account, they will be prompted to (optionally) set up OTP
  } catch (err) {
    next(err);
  }
};

/**
 * Verify OTP code sent upon account creation
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response
 */
const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { otpCode, email } = req.body as { otpCode: string; email: string };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }

    const verified = await verifyEmailOtp(email, otpCode);

    if (verified === 'approved') {
      user.emailConfirmed = true;
      await user.save();

      req.session.regenerate((err: any) => {
        if (err) next(err);

        req.session.user = { id: user._id, name: user.name };

        req.session.save((error: any) => {
          if (error) return next(error);
          return res
            .status(200)
            .json({ responseCode: res.statusCode, responseBody: user });
        });
      });
    } else {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Resend otp to phone or email
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response
 */
const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { contactInfo, contactMethod } = req.body as {
    contactInfo: string;
    contactMethod: 'phone' | 'email';
  };

  try {
    let user = null;

    if (contactMethod === 'email') {
      user = await User.findOne({ email: contactInfo });
    } else {
      user = await User.findOne({ phone: contactInfo });
    }

    if (!user) {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }

    if (contactMethod === 'phone') {
      const otpStatus = await sendOtp(user.phone);

      if (otpStatus) {
        return res.status(200).json({
          responseCode: res.statusCode,
          responseBody: 'OTP pending verification',
        });
      }

      return res.status(500).json({
        responseCode: res.statusCode,
        responseBody: 'Internal server error',
      });
    }

    const otpStatus = await sendEmailOtp(user.email);

    if (otpStatus) {
      return res.status(200).json({
        responseCode: res.statusCode,
        responseBody: `OTP pending verification for ${user.email}`,
      });
    }

    return res.status(500).json({
      responseCode: res.statusCode,
      responseBody: 'Internal server error',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Team member sign up after receiving an invitation to join a company
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response
 */
const userSignup = async (req: Request, res: Response, next: NextFunction) => {
  const validCredentials = validateUserSignupSchema(req);

  if (!validCredentials) {
    return res.status(422).json({
      responseCode: res.statusCode,
      responseBody:
        'Unable to process user credentials. Ensure credentials are entered correctly before trying again.',
    });
  }

  const { phone, email, company } = req.body as SignupCredentials;

  try {
    const existingUser = await User.find({
      $or: [{ email }, { phone }],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (!_.isEmpty(existingUser)) {
      return res.status(422).json({
        responseCode: res.statusCode,
        responseBody: 'Email or phone number is already in use.',
      });
    }

    // check if company exists
    if (!company) {
      return res.status(422).json({
        responseCode: res.statusCode,
        responseBody: 'Ensure company name is included with user credentials.',
      });
    }

    const existingCompany: ICompany = (await Company.findOne({
      companyName: company,
    })) as ICompany;

    if (_.isEmpty(existingCompany)) {
      return res.status(404).json({
        responseCode: res.statusCode,
        responseBody: 'Company not found.',
      });
    }

    const credentials = req.body as SignupCredentials;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const userIsInvited = existingCompany.invitees?.find(
      (invitee) => invitee.email === credentials.email,
    );

    if (!userIsInvited) {
      return res
        .status(401)
        .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
    }

    const user = new User({
      name: credentials.name,
      email: credentials.email,
      emailConfirmed: false, // need to confirm on first login
      phoneConfirmed: false,
      address: {
        streetAddress: credentials.streetAddress,
        address2: credentials.address2,
        city: credentials.city,
        state: credentials.state,
        country: credentials.country,
        zipCode: credentials.zipCode,
      },
      phone: credentials.phone,
      role: credentials.role,
      title: credentials.title,
      salary: credentials.salary,
      preferences: {
        otp: credentials.preferences?.otp, // don't allow otp preference to be set until user confirms phone number
      },
      company: credentials.company,
    });

    user.hash = await user.setPassword(credentials.password);
    await user.save();
    const otpStatus = await sendEmailOtp(user.email);

    if (otpStatus) {
      return res.status(200).json({
        responseCode: res.statusCode,
        responseBody: 'Email pending verification',
      });
    }

    return res.status(500).json({
      responseCode: res.statusCode,
      responseBody: 'Internal server error',
    });
    // send OTP via email (need to write email otp function)
    // confirm email to finish setting up account -- after they set up account, they will be prompted to (optionally) set up OTP
  } catch (err) {
    next(err);
  }
};

export {
  login,
  loginOtp,
  logout,
  adminSignup,
  confirmEmail,
  resendOtp,
  userSignup,
};

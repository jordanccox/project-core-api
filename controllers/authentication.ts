import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { sendOtp, verifyOtp } from '../services/twilio';
import { validateUserSignupSchema } from '../models/validate';
import { SignupCredentials } from '../types/user.interface';

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

// logout
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
// ADMIN sign up
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
    const existingUser = await User.find({ $or: [{ email }, { phone }] });

    if (existingUser) {
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
        streetAddress: credentials.address.streetAddress,
        address2: credentials.address.address2,
        city: credentials.address.city,
        state: credentials.address.state,
        country: credentials.address.country,
        zipCode: credentials.address.zipCode,
      },
      phone: credentials.phone,
      role: credentials.role,
      title: credentials.title,
      salary: credentials.salary,
      preferences: {
        otp: credentials.preferences?.otp, // don't allow otp preference to be set until user confirms phone number
      },
    });

    user.hash = await user.setPassword(credentials.password);
    await user.save();
    // send OTP via email (need to write email otp function)
    // confirm email to finish setting up account -- after they set up account, they will be prompted to (optionally) set up OTP
  } catch (err) {
    next(err);
  }
};

// invitee (can be invited as a user or admin, but can't change role) sign up

// confirm email

// confirm phone number

// logout

// export

export { login, loginOtp, logout };

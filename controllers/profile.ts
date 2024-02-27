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

// edit profile

// confirm phone number

/**
 * Send OTP for phone number confirmation
 * @param req Request object (expects a logged-in user session)
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response indicating if the OTP was sent successfully
 */
const sendPhoneOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get user ID from session (ensure middleware is in place to guarantee this is populated)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (!req.session.user) {
      return res.end();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = req.session.user.id;

    // Fetch user from the database (replace User with your actual model)
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ responseCode: res.statusCode, responseBody: 'User not found' });
    }

    // Send OTP and handle response
    const sendOtpStatus = await sendOtp(user.phone);
    if (sendOtpStatus === 'pending') {
      return res
        .status(200)
        .json({ responseCode: res.statusCode, responseBody: 'OTP sent' });
    }
    // Handle errors - Twilio's Verify API usually returns a descriptive error message in this case
    return res.status(500).json({
      responseCode: res.statusCode,
      responseBody: 'OTP failed to send',
    });
  } catch (err) {
    next(err);
  }
};

// /**
//  * Send OTP code to phone number on account
//  * @param req Request object
//  * @param res Response object
//  * @param next NextFunction
//  * @returns JSON response indicating success or failure
//  */
// const sendPhoneOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     if (!req.session.user) {
//       return res
//         .status(401)
//         .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
//     }

//     const { id } = req.session.user;

//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     const user = await User.findOne({ _id: id });

//     if (!user) {
//       return res
//         .status(401)
//         .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
//     }

//     if (user.phoneConfirmed) {
//       return res.status(200).json({
//         responseCode: res.statusCode,
//         responseBody: 'Phone number already confirmed',
//       });
//     }

//     const otpStatus = await sendOtp(user.phone);

//     if (otpStatus) {
//       return res.status(200).json({
//         responseCode: res.statusCode,
//         responseBody: 'OTP pending verification',
//       });
//     }

//     return res.status(500).json({
//       responseCode: res.statusCode,
//       responseBody: 'Internal server error',
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/**
 * Confirm phone number via OTP
 * @param req Request object containing phone number and OTP code in the body
 * @param res Response object
 * @param next NextFunction
 * @returns JSON response indicating success or failure
 */
const verifyPhoneOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { otpCode, phone } = req.body as { otpCode: string; phone: string };

  try {
    // Assuming you have a User model where phone numbers are stored. Adjust as needed
    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ responseCode: res.statusCode, responseBody: 'User not found' });
    }

    const verified = await verifyOtp(phone, otpCode);

    if (verified === 'approved') {
      user.phoneConfirmed = true; // Assuming a boolean field indicating phone confirmation
      await user.save();
      return res.status(200).json({
        responseCode: res.statusCode,
        responseBody: 'Phone number confirmed',
      });
    }
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseBody: 'Invalid OTP code' });
  } catch (err) {
    next(err);
  }
};

// turn on otp = true

// change password

// recover password

// delete profile

export { sendPhoneOtp, verifyPhoneOtp };

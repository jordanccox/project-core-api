import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import { sendOtp, verifyOtp } from '../services/twilio';

/**
 * Logs user in to an existing account. If user has otp set to true, an otp will be sent via sms and the user will have to submit the otp code to log in
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns res
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
  }

  const validPassword = await user.validatePassword(password);

  if (!validPassword) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseBody: 'Unauthorized' });
  }

  // Check if OTP is enabled
  if (user.preferences.otp) {
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
// sign up

// require authentication middleware

// logout

// export

export { login, loginOtp, logout };

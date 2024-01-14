import { NextFunction, Request, Response } from 'express';
import User from '../models/user';

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    return next();
  }
  return res
    .status(401)
    .json({ responseCode: res.statusCode, responseMessage: 'Unauthorized' });
};

const requireLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseMessage: 'Unauthorized' });
  }

  const validPassword = await user.validatePassword(password);

  if (!validPassword) {
    return res
      .status(401)
      .json({ responseCode: res.statusCode, responseMessage: 'Unauthorized' });
  }

  // Check if OTP is enabled
  if (user.preferences.otp) {
    // call otp middleware // sendOtp()
    // initiate otp // return next()
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

export { authenticateUser, requireLogin };

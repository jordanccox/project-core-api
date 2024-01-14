import { NextFunction, Request, Response } from 'express';
import User from '../models/user';

/**
 * Log in to an existing account
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 * @returns res
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json('Unauthorized');
  }

  const validPassword = await user.validatePassword(password);

  if (!validPassword) {
    return res.status(401).json('Unauthorized');
  }

  req.session.regenerate((err: any) => {
    if (err) next(err);

    req.session.user = { id: user._id, name: user.name };

    req.session.save((error: any) => {
      if (error) return next(error);
      return res.status(200).json(user);
    });
  });
};

// sign up

// require authentication middleware

// logout

// export

export { login };

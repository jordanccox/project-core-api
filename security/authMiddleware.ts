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

export { authenticateUser };

/* eslint-disable @typescript-eslint/no-namespace */
import passport = require('passport');
import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../models/user';
import { UserWithValidation } from '../types/user.interface';

declare global {
  namespace Express {
    interface User {
      _id: string;
      name: string;
      email: string;
    }
  }
}

passport.serializeUser((user, done) => {
  process.nextTick(() =>
    done(null, {
      id: user._id,
      name: user.name,
      email: user.email,
    }),
  );
});

passport.deserializeUser((user: Express.User, done) => {
  process.nextTick(() => done(null, user));
});

passport.use(
  new LocalStrategy(async (email, password, done) => {
    const user = (await UserModel.findOne({ email })) as UserWithValidation;

    if (!user) return done(null, false);

    const validPassword = await user.validatePassword(password);

    if (validPassword) {
      return done(null, user);
    }

    return done(null, false);
  }),
);

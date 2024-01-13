/* eslint-disable @typescript-eslint/no-namespace */
import passport = require('passport');
import LocalStrategy = require('passport-local');

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

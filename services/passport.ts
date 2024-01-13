/* eslint-disable @typescript-eslint/no-namespace */
import passport = require('passport');
import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../models/user';

// declare global {
//   namespace Express {
//     interface User {
//       _id: string;
//       name: string;
//       email: string;
//     }
//   }
// }

// passport.serializeUser((user, done) => {
//   process.nextTick(() =>
//     done(null, {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//     }),
//   );
// });

// passport.deserializeUser((user: Express.User, done) => {
//   process.nextTick(() => done(null, user));
// });

// export const localStrategy = new LocalStrategy(
//   async (email, password, done) => {
//     const user = await UserModel.findOne({ email });

//     if (!user) return done(null, false);

//     const validPassword = await user.validatePassword(password);

//     if (validPassword) {
//       return done(null, user);
//     }

//     return done(null, false);
//   },
// );

export const localStrategy = new LocalStrategy((email, password, done) => {
  const user = {
    email: 'jordan.c.cox.1@gmail.com',
    _id: '65a2c4971dce0c7b649a5f3a',
    name: 'Jordan',
  };

  const validPassword = true;

  if (validPassword) {
    return done(null, user);
  }
});

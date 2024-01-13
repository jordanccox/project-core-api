import express = require('express');
import mongoose = require('mongoose');
import session = require('express-session');
import MongoStore = require('connect-mongo');

import passport = require('passport');

import { Strategy as LocalStrategy } from 'passport-local';

import User from './models/user';

const app = express();

mongoose.connect('mongodb://localhost/test');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'helloworld',
    cookie: { maxAge: 86400000, secure: false }, // set to true in production
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost/test' }),
  }),
);

app.use(passport.initialize()); // passport is middleware, so it must be implemented using app.use()
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user to retrieve the user object from the session

passport.deserializeUser((user: Express.User, done) => {
  process.nextTick(() => done(null, user));
});

passport.use(
  new LocalStrategy(async (email, password, done) => {
    const user = await User.findOne({ email });

    if (!user) return done(null, false);

    const valid = await user.validatePassword(password);

    if (valid === false) {
      return done(null, false);
    }

    return done(null, user);
  }),
);

app.get('/login', (req, res) => {
  res.type('html');
  res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
    </head>
    <body>
      <form method="post" action="/login">
        <label>Email</label>
        <input type="text" name="email" />
        <br />
        <label>Password</label>
        <input type="password" name="password" />

        <button type="submit">Login</button>
      </form>
    </body>
    </html>`,
  );
});

app.post(
  '/login',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => res.send('SUCCESS'),
);

const PORT = 4001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

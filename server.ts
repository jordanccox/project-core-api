import express = require('express');
import mongoose = require('mongoose');
import cors = require('cors');
import passport = require('passport');
import session = require('express-session');
import MongoStore = require('connect-mongo');

import keys from './config/keys';
import router from './routes/router';
import { localStrategy } from './services/passport';

// test
// eslint-disable-next-line import/order
import { RequestHandler } from 'express';
// test

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false }, // 24 hours. Secure set to false for dev environment
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: keys.MONGO_URI }),
  }),
);

app.use(passport.initialize());
app.use(passport.session()); // requires session authentication for every route. Alternatively can be used as middleware on specific routes
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

passport.use(localStrategy);
// app.use(router);

app.post(
  '/login',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate('local', {
    failureRedirect: '/login',
  }),
  (req, res) => res.send('Success!'),
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

// Server setup
const PORT = process.env.PORT || 8080;

// Database setup
(async function connectToServer() {
  try {
    await mongoose.connect(keys.MONGO_URI);
  } catch (err: any) {
    return console.log(`Error: ${err}`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

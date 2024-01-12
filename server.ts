import express = require('express');
import mongoose = require('mongoose');
import cors = require('cors');
import passport = require('passport');
import LocalStrategy = require('passport-local');
import session = require('express-session');
import MongoStore = require('connect-mongo');

import keys from './config/keys';
import router from './routes/router';

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
app.use(passport.session());
app.use(router);

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

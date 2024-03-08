import express = require('express');
import mongoose = require('mongoose');
import cors = require('cors');
import session = require('express-session');
import MongoStore = require('connect-mongo');

import keys from './config/keys';
import router from './routes/router';

const app = express();

// Type declarations
declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any } | null;
  }
}

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 14, secure: false },
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: keys.MONGO_URI }),
  }),
);

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

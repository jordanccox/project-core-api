import { RequestHandler, Router } from 'express';
import passport = require('passport');
import User from '../models/user';

const router = Router();

/**
 * TEST ROUTES BELOW
 */

router.get('/', (req, res) => {
  res.type('json').send({ status: res.statusCode, message: 'Hello world!' });
});

router.post('/login', async (req, res, next) => {
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
      return res.status(200).redirect('/profile');
    });
  });
});

router.get('/login', (req, res) => {
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

router.get('/profile', (req, res) => {
  const { user } = req.session;
  res.status(200).json({ message: 'success', user });
});

router.get('/create-test-user', async (req, res) => {
  const user = new User({
    name: 'Jordan',
    email: process.env.EMAIL,
    address: '123 Main St',
    phone: process.env.PHONE,
    role: 'admin',
    title: 'Business Manager',
    salary: 50000,
    preferences: {
      otp: true,
      verificationMethod: 'phone',
    },
  });

  user.hash = await user.setPassword('mypassword');
  await user.save();
  res.end();
});

export default router;

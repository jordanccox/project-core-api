import { RequestHandler, Router } from 'express';
import User from '../models/user';

import authenticationController = require('../controllers/authentication');
import companyController = require('../controllers/company');
import { authenticateUser } from '../security/authMiddleware';

const router = Router();

/**
 * User authentication routes
 */
router.post('/user/login', authenticationController.login);
router.post('/user/login/verify-otp', authenticationController.loginOtp);
router.post('/user/logout', authenticationController.logout);
router.post('/user/admin-signup', authenticationController.adminSignup);
router.post('/user/user-signup', authenticationController.userSignup);
router.post(
  '/user/signup/verify-email-otp',
  authenticationController.confirmEmail,
);
router.get('/user/resend-otp', authenticationController.resendOtp);
// /user/send-phone-otp confirmation
// /user/verify-phone-otp

/**
 * Company routes
 */
router.post(
  '/company/create-company',
  authenticateUser,
  companyController.companyCreation,
);

// create a company -- admins only
// invite team members to company -- admins only

/**
 * TEST ROUTES BELOW
 */

router.get('/company/create-company', (req, res) => {
  res.type('html');
  res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Create Company</title>
    </head>
    <body>
      <form method="post" action="/company/create-company">
        <label>Company Name</label>
        <input type="text" name="companyName" />
        <br />
        <label>country</label>
        <input type="text" name="country" />

        <button type="submit">Create Company</button>
      </form>
    </body>
    </html>`,
  );
});

router.get('/user/resend-otp-form', (req, res) => {
  res.type('html');
  res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Email</title>
    </head>
    <body>
      <form method="get" action="/user/resend-otp">
        <label>Contact Info</label>
        <input type="text" name="contactInfo" />
        <br />
        <label>Contact Method</label>
        <input type="text" name="contactMethod" />

        <button type="submit">Resend OTP</button>
      </form>
    </body>
    </html>`,
  );
});

router.get('/user/signup/verify-email-otp', (req, res) => {
  res.type('html');
  res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Email</title>
    </head>
    <body>
      <form method="post" action="/user/signup/verify-email-otp">
        <label>Email</label>
        <input type="text" name="email" />
        <br />
        <label>OTP</label>
        <input type="password" name="otpCode" />

        <button type="submit">Verify</button>
      </form>
    </body>
    </html>`,
  );
});

router.get('/user/admin-signup', (req, res) => {
  res.type('html');
  res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Signup</title>
    </head>
    <body>
      <form method="post" action="/user/admin-signup">
        <label>Name</label>
        <input type="text" name="name" />
        <br />
        <label>Email</label>
        <input type="text" name="email" />
        <br />
        <label>Password</label>
        <input type="password" name="password" />
        <br />
        <label>Street Address</label>
        <input type="text" name="streetAddress" />
        <br />
        <label>Address 2</label>
        <input type="text" name="address2" />
        <br />
        <label>City</label>
        <input type="text" name="city" />
        <br />
        <label>State</label>
        <input type="text" name="state" />
        <br />
        <label>2 Letter Country Code</label>
        <input type="text" name="country" />
        <br />
        <label>Zip</label>
        <input type="text" name="zipCode" />
        <br />
        <label>phone</label>
        <input type="text" name="phone" />
        <br />
        <label>Role (admin | user)</label>
        <input type="text" name="role" />
        <br />
        <label>Title</label>
        <input type="text" name="title" />
        <br />
        <label>Salary</label>
        <input type="text" name="salary" />
        <button type="submit">Sign up</button>
      </form>
    </body>
    </html>`,
  );
});

router.get('/user/logout', (req, res) => {
  res.type('html');
  res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logout</title>
    </head>
    <body>
      <form method="post" action="/user/logout">

        <button type="submit">Logout</button>
      </form>
    </body>
    </html>`,
  );
});

router.get('/user/login/verify-otp', (req, res) => {
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
      <form method="post" action="/user/login/verify-otp">
        <label>Email</label>
        <input type="text" name="email" />
        <br />
        <label>OTP</label>
        <input type="password" name="otpCode" />

        <button type="submit">Verify</button>
      </form>
    </body>
    </html>`,
  );
});

router.get('/', (req, res) => {
  res.type('json').send({ status: res.statusCode, message: 'Hello world!' });
});

router.get('/profile', authenticateUser, (req, res) => {
  const { user } = req.session;
  res.status(200).json({ message: 'success', user });
});

router.get('/user/login', (req, res) => {
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
      <form method="post" action="/user/login">
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

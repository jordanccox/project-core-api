import { RequestHandler, Router } from 'express';
import passport = require('passport');

const router = Router();

/**
 * TEST ROUTES BELOW
 */

router.get('/', (req, res) => {
  res.type('json').send({ status: res.statusCode, message: 'Hello world!' });
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
  }) as RequestHandler,
  (req, res) => res.redirect('/profile'),
);

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
  const { user } = req;

  res.send(user);
});

export default router;

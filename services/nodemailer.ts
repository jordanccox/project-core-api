/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.forwardemail.net',
  port: 587,
  secure: false,
  auth: {
    user: process.env.FORWARD_EMAIL,
    pass: process.env.FORWARD_PASSWORD,
  },
});

async function main() {
  const info = await transporter.sendMail({
    from: '"Jordan Cox" <noreply@projectco.co>',
    to: 'jordancox747@outlook.com',
    subject: 'HEllo',
    text: 'Hello world',
    html: '<b>Hello world</b>',
  });

  console.log('Message sent: %s', info.messageId);
}

main().catch(console.error);

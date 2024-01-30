/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.forwardemail.net',
  port: 587,
  secure: false, // development
  auth: {
    user: process.env.FORWARD_EMAIL,
    pass: process.env.FORWARD_PASSWORD,
  },
});

const sendInvite = async (
  invitee: { email: string; name: string },
  companyName: string,
) => {
  try {
    const info = await transporter.sendMail({
      from: '"Project Core" <noreply@projectcore.co>',
      to: invitee.email,
      subject: `You've been invited to join ${companyName}'s Project Core team`,
      text: `Hello, ${invitee.name}, you've beeen invited to join ${companyName} on Project Core [insert link here]. Click here and follow the instructions on the web page.`,
      html: `<p>Hello, ${invitee.name}, you've beeen invited to join ${companyName} on Project Core [insert link here]. Click here and follow the instructions on the web page.</p>`, // eventually insert link for them to click
    });

    return info;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export { sendInvite };

// async function main() {
//   const info = await transporter.sendMail({
//     from: '"Jordan Cox" <noreply@projectcore.co>',
//     to: 'jordancox747@outlook.com',
//     subject: 'HEllo',
//     text: 'Hello world',
//     html: '<b>Hello world</b>',
//   });

//   console.log('Message sent: %s', info.messageId);
// }

// main().catch(console.error);

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Twilio = require('twilio');
import readline = require('readline');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

const client = Twilio(accountSid, authToken);

const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// const sendOtp = (phone: string) => {
//   if (accountSid && authToken && verifySid) {
//     const client = new Twilio(accountSid, authToken);

//     client.verify.v2
//       .services(verifySid)
//       .verifications.create({ to: phone, channel: 'sms' })
//       .then((verification: any) => console.log(verification))
//       .then(verifyOtp(phone, client));
//   }
// };

// const verifyOtp = (phone: string, client: any) => {

//   client.verify.v2
//     .services(verifySid)
//     .verificationChecks.
// };

const sendOtp = async (phone: string) => {
  try {
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });
    console.log(verification.status);
    const otpCode = await new Promise((resolve) =>
      userInterface.question('Enter OTP:', resolve),
    );
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: phone,
        code: otpCode,
      });
    console.log(verificationCheck);
  } catch (error: any) {
    console.log(error);
  } finally {
    userInterface.close();
  }
};

sendOtp('+19708892840');

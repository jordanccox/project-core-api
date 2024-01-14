import Twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

const sendOtp = (phone: string) => {
  if (accountSid && authToken && verifySid) {
    const client = new Twilio(accountSid, authToken);

    client.verify.v2
      .services(verifySid)
      .verifications.create({ to: phone, channel: 'sms' })
      .then((verification: any) => console.log(verification.status));
  }
};

sendOtp('+19708892840');

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

const client = Twilio(accountSid, authToken);

/**
 * Sends otp code to phone number on record
 * @param phone 11 digit phone number in format +12345678901
 * @returns Promise<string | null>
 */
const sendOtp = async (phone: string): Promise<string | null> => {
  try {
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });
    return verification.status;
  } catch (err: any) {
    console.log(err);
    return null;
  }
};

/**
 * Verifies otp code
 * @param phone 11 digit phone number in format +12345678901
 * @param otpCode otp code sent to user's phone number
 * @returns Promise<string | null>
 */
const verifyOtp = async (
  phone: string,
  otpCode: string,
): Promise<string | null> => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: phone, code: otpCode });

    return verificationCheck.status;
  } catch (err: any) {
    console.log(err);
    return null;
  }
};

/**
 * Sends otp code for email verification
 * @param email User email
 * @returns Promise<string | null>
 */
const sendEmailOtp = async (email: string): Promise<string | null> => {
  try {
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({
        to: email,
        channel: 'email',
      });
    return verification.status;
  } catch (err: any) {
    console.log(err);
    return null;
  }
};

/**
 * Verifies otp code sent to email
 * @param email User email
 * @param otpCode otp code sent to user's email
 * @returns Promise<string | null>
 */
const verifyEmailOtp = async (
  email: string,
  otpCode: string,
): Promise<string | null> => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: email, code: otpCode });

    return verificationCheck.status;
  } catch (err: any) {
    console.log(err);
    return null;
  }
};

export { sendOtp, verifyOtp, sendEmailOtp, verifyEmailOtp };

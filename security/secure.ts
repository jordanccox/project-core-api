import crypto = require('crypto');
import bcrypt = require('bcrypt');

/**
 * Hash and salt a user's password before storing hash in the database
 * @param password user supplied password
 * @param saltRounds
 * @returns hashed password
 */
const hashPassword = async (
  password: string,
  saltRounds: number,
): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * Validate password
 * @param password user supplied password
 * @param hash hashed password associated with user
 * @returns Promise<boolean>
 */
const comparePasswords = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const matchFound = await bcrypt.compare(password, hash);
  return matchFound;
};
// Encrypt PII data

// Decrypt PII data

// export

export { hashPassword, comparePasswords };

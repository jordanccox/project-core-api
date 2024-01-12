import crypto = require('crypto');
import bcrypt = require('bcrypt');

// Hash and salt passwords
const hashPassword = async (
  password: string,
  saltRounds: number,
): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};
// Validate passwords
const comparePasswords = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const matchFound = await bcrypt.compare(password, hash);
  return matchFound;
};
// Encrypt data

// Decrypt data

// export

const secure = {
  hashPassword,
  comparePasswords,
};

export default secure;

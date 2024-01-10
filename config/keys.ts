/**
 * Define keys for production and development environments
 */

interface Keys {
  MONGO_URI: string;
  SESSION_SECRET: string;
}

const keys: Keys = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/project-core',
  SESSION_SECRET: process.env.SESSION_SECRET || 'helloworld',
};

export default keys;

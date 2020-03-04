import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.WEBTOKEN_SECRET_KEY,
  expire: process.env.WEBTOKEN_EXPIRATION_TIME || '7d',
}));

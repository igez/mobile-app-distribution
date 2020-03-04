import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  DB_URL: process.env.DB_URL,
}));

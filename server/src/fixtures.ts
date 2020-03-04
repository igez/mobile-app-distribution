import { model, createConnection } from 'mongoose';
import * as crypto from 'crypto';

import { AppRoles } from '@app/modules/app/app.roles';
import { User } from '@app/modules/user/user.model';

export const setupFixtures = async () => {
  const conn = createConnection(process.env.DB_URL);
  const userModel = conn.model('User', User);
  // Add default user john@doe.com:s3cr3t
  const defaultUser = await userModel.findOne({ username: 'admin' });

  if (!defaultUser) {
    await userModel.create({
      username: 'admin',
      password: crypto.createHmac('sha256', 'password').digest('hex'),
      email: 'admin@mail.com',
      name: 'admin',
      roles: [AppRoles.ADMIN],
    });
  }
};

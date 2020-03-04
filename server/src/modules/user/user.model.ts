import { Schema, Document } from 'mongoose';
import { AppRoles } from '@app/modules/app/app.roles';

/**
 * Mongoose Profile Schema
 */
export const User = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  roles: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Mongoose Profile Document
 */
export interface IUser extends Document {
  /**
   * UUID
   */
  readonly _id: Schema.Types.ObjectId;
  /**
   * Username
   */
  readonly username: string;
  /**
   * Email
   */
  readonly email: string;
  /**
   * Name
   */
  readonly name: string;
  /**
   * Password
   */
  password: string;
  /**
   * Roles
   */
  readonly roles: AppRoles;
  /**
   * Date
   */
  readonly createdAt: Date;
}

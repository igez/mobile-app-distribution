import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { IUser } from './user.model';
import { RegisterPayload } from '@app/modules/auth/payload/register.payload';
import { PatchUserPayload } from './payload/patch.user.payload';
import { AppRoles } from '@app/modules/app/app.roles';

/**
 * Models a typical response for a crud operation
 */
export interface IGenericMessageBody {
  /**
   * Status message to return
   */
  message: string;
}

/**
 * User Service
 */
@Injectable()
export class UserService {
  /**
   * Constructor
   * @param {Model<IUser>} userModel
   */
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  /**
   * Fetches a user from database by UUID
   * @param {string} id
   * @returns {Promise<IUser>} queried user data
   */
  get(id: string): Promise<IUser> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Fetches a user from database by username
   * @param {string} username
   * @returns {Promise<IUser>} queried user data
   */
  getByUsername(username: string): Promise<IUser> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * Fetches a user by their username and hashed password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<IUser>} queried user data
   */
  getByUsernameAndPass(username: string, password: string): Promise<IUser> {
    return this.userModel
      .findOne({
        username,
        password: crypto.createHmac('sha256', password).digest('hex'),
      })
      .exec();
  }

  /**
   * Create a user with RegisterPayload fields
   * @param {RegisterPayload} payload user payload
   * @returns {Promise<IUser>} created user data
   */
  async create(payload: RegisterPayload): Promise<IUser> {
    const user = await this.getByUsername(payload.username);
    if (user) {
      throw new NotAcceptableException(
        'The account with the provided username currently exists. Please choose another one.',
      );
    }
    // this will auto assign the admin role to each created user
    const createdUser = new this.userModel({
      ...payload,
      password: crypto.createHmac('sha256', payload.password).digest('hex'),
      roles: AppRoles.ADMIN,
    });

    return createdUser.save();
  }

  /**
   * Edit user data
   * @param {PatchUserPayload} payload
   * @returns {Promise<IUser>} mutated user data
   */
  async edit(payload: PatchUserPayload): Promise<IUser> {
    const { username } = payload;
    const updatedUser = await this.userModel.updateOne({ username }, payload);
    if (updatedUser.nModified !== 1) {
      throw new BadRequestException(
        'The user with that username does not exist in the system. Please try another username.',
      );
    }
    return this.getByUsername(username);
  }

  /**
   * Delete user given a username
   * @param {string} username
   * @returns {Promise<IGenericMessageBody>} whether or not the crud operation was completed
   */
  delete(username: string): Promise<IGenericMessageBody> {
    return this.userModel.deleteOne({ username }).then(user => {
      if (user.deletedCount === 1) {
        return { message: `Deleted ${username} from records` };
      } else {
        throw new BadRequestException(
          `Failed to delete a user by the name of ${username}.`,
        );
      }
    });
  }
}

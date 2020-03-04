import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService, IGenericMessageBody } from './user.service';
import { PatchUserPayload } from './payload/patch.user.payload';
import { IUser } from './user.model';

/**
 * User Controller
 */
@ApiBearerAuth()
@ApiTags('user')
@Controller('api/user')
export class UserController {
  /**
   * Constructor
   * @param userService
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves a particular user
   * @param username the user given username to fetch
   * @returns {Promise<IUser>} queried user data
   */
  @Get(':username')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Fetch User Request Received' })
  @ApiResponse({ status: 400, description: 'Fetch User Request Failed' })
  async getUser(@Param('username') username: string): Promise<IUser> {
    const user = await this.userService.getByUsername(username);
    if (!user) {
      throw new BadRequestException(
        'The user with that username could not be found.',
      );
    }
    return user;
  }

  /**
   * Edit a user
   * @param {RegisterPayload} payload
   * @returns {Promise<IUser>} mutated user data
   */
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  @UseRoles({
    resource: 'users',
    action: 'update',
    possession: 'any',
  })
  @ApiResponse({ status: 200, description: 'Patch User Request Received' })
  @ApiResponse({ status: 400, description: 'Patch User Request Failed' })
  async patchUser(@Body() payload: PatchUserPayload) {
    return await this.userService.edit(payload);
  }

  /**
   * Removes a user from the database
   * @param {string} username the username to remove
   * @returns {Promise<IGenericMessageBody>} whether or not the user has been deleted
   */
  @Delete(':username')
  @UseGuards(AuthGuard('jwt'), ACGuard)
  @UseRoles({
    resource: 'users',
    action: 'delete',
    possession: 'any',
  })
  @ApiResponse({ status: 200, description: 'Delete User Request Received' })
  @ApiResponse({ status: 400, description: 'Delete User Request Failed' })
  async delete(
    @Param('username') username: string,
  ): Promise<IGenericMessageBody> {
    return await this.userService.delete(username);
  }
}

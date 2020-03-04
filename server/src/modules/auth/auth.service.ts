import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { IUser } from '@app/modules/user/user.model';
import { LoginPayload } from './payload/login.payload';

/**
 * Models a typical Login/Register route return body
 */
export interface ITokenReturnBody {
  /**
   * When the token is to expire in seconds
   */
  expires: string;
  /**
   * A human-readable format of expires
   */
  expiresPrettyPrint: string;
  /**
   * The Bearer token
   */
  token: string;
}

/**
 * Authentication Service
 */
@Injectable()
export class AuthService {
  /**
   * Time in seconds when the token is to expire
   * @type {string}
   */
  private readonly expiration: string;

  /**
   * Constructor
   * @param {JwtService} jwtService jwt service
   * @param {ConfigService} configService
   * @param {UserService} userService user service
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.expiration = this.configService.get('WEBTOKEN_EXPIRATION_TIME');
  }

  /**
   * Creates a signed jwt token based on IUser payload
   * @param {User} param dto to generate token from
   * @returns {Promise<ITokenReturnBody>} token body
   */
  async createToken({
    _id,
    username,
    email,
  }: IUser): Promise<ITokenReturnBody> {
    return {
      expires: this.expiration,
      expiresPrettyPrint: AuthService.prettyPrintSeconds(this.expiration),
      token: this.jwtService.sign({ _id, username, email }),
    };
  }

  /**
   * Formats the time in seconds into human-readable format
   * @param {string} time
   * @returns {string} hrf time
   */
  private static prettyPrintSeconds(time: string): string {
    const ntime = Number(time);
    const hours = Math.floor(ntime / 3600);
    const minutes = Math.floor((ntime % 3600) / 60);
    const seconds = Math.floor((ntime % 3600) % 60);

    return `${hours > 0 ? hours + (hours === 1 ? ' hour,' : ' hours,') : ''} ${
      minutes > 0 ? minutes + (minutes === 1 ? ' minute' : ' minutes') : ''
    } ${seconds > 0 ? seconds + (seconds === 1 ? ' second' : ' seconds') : ''}`;
  }

  /**
   * Validates whether or not the user exists in the database
   * @param {LoginPayload} payload login payload to authenticate with
   * @returns {Promise<IUser>} registered user
   */
  async validateUser(payload: LoginPayload): Promise<IUser> {
    const user = await this.userService.getByUsernameAndPass(
      payload.username,
      payload.password,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Could not authenticate. Please try again.',
      );
    }
    return user;
  }
}

import {
  Render,
  Controller,
  Res,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
  Post,
  NotAcceptableException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { BuildService, OSType } from '../build';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * App Controller
 */
@Controller()
@ApiBearerAuth()
export class AppController {
  /**
   * Constructor
   * @param appService
   * @param profileService
   */
  constructor(
    private readonly appService: AppService,
    private readonly buildService: BuildService,
    private readonly configService: ConfigService,
  ) {}

  @Get('d/:id')
  @Render('index')
  async buildIndex(@Param('id') id: string) {
    let build = await this.buildService.getById(id);

    if (!build) {
      throw new NotFoundException();
    }

    return {
      buildId: id,
      appUrl: this.configService.get('APP_URL'),
      build: Object.keys(build).reduce(
        o => ({
          ...build,
          info: {
            ...build.info,
            thumbnail: build.info.thumbnail.replace(
              '%APP_URL%',
              this.configService.get('APP_URL'),
            ),
          },
        }),
        {},
      ),
    };
  }

  @Get('d/build/:id')
  async downloadApp(@Param('id') id: string, @Res() res) {
    let build = await this.buildService.getById(id);

    if (!build) {
      throw new NotFoundException();
    }

    const stats = fs.statSync(path.resolve('.', 'builds/ios', `${id}.ipa`));

    if (build.type === OSType.IOS) {
      const stream = fs.createReadStream(
        path.resolve('.', 'builds/ios', `${id}.ipa`),
      );

      res.set({
        'Content-Length': stats.size,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `${id}.plist`,
      });

      stream.pipe(res);
    } else {
      throw new NotAcceptableException();
    }
  }

  @Get('d/plist/:id')
  async downloadManifest(@Param('id') id: string, @Res() res) {
    let build = await this.buildService.getById(id);

    if (!build) {
      throw new NotFoundException();
    }

    const stream = fs.createReadStream(
      path.resolve('.', 'builds/ios', `${id}_manifest.plist`),
    );

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `${id}.plist`,
    });

    stream.pipe(res);
  }

  /**
   * Returns the an environment variable from config file
   * @returns {string} the application environment url
   */
  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Request Received' })
  @ApiResponse({ status: 400, description: 'Request Failed' })
  getString(): string {
    return this.appService.root();
  }

  /**
   * Fetches request metadata
   * @param {Req} req the request body
   * @returns {Partial<Request>} the request user populated from the passport module
   */
  @Get('request/user')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Request Received' })
  @ApiResponse({ status: 400, description: 'Request Failed' })
  getProfile(@Req() req): Partial<Request> {
    return req.user;
  }
}

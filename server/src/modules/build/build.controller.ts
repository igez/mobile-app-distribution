import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { exec } from 'child_process';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

import { OSType } from '@app/modules/build/build.model';
import { CreateBuildDTO, CreateBuildInfoDTO } from './dto/createBuild.dto';
import { BuildService } from './build.service';
import { File } from 'multer';

/**
 * User Controller
 */
@ApiBearerAuth()
@ApiTags('build')
@Controller('api/build')
export class BuildController {
  /**
   * Constructor
   */
  constructor(
    private readonly buildService: BuildService,
    private readonly configService: ConfigService,
  ) {}

  async generateManifestFromIPA(file: File, appId: String) {
    // ipa_plist_gen -i "https://www.dropbox.com/s/rbnf5qhx2axpbm5/Sentral%20Tunjungan.ipa\?dl\=1" -b 'com.vodjo.sentraltunjungan' 'Sentral Tunjungan'
    return new Promise(async (resolve, reject) => {
      const downloadUrl = `${this.configService.get(
        'APP_URL',
      )}/${this.configService.get('BUILD_DOWNLOAD_SCHEMA')}/build/${file.filename.substring(0, file.filename.length - 4)}`;
      const fileName = file.originalname.substring(
        0,
        file.originalname.length - 4,
      );

      exec(
        `ipa_plist_gen -i '${downloadUrl}' -b '${appId}' -t '${fileName}'`,
        (err, stdout, stderr) => {
          if (err) {
            console.log(`error: ${err.message}`);
            return reject(err);
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return reject(stderr);
          }

          resolve(stdout);
        },
      );
    });
  }

  async getAppInfo(file: File): Promise<CreateBuildInfoDTO> {
    const buildType =
      extname(file.filename) === '.ipa' ? OSType.IOS : OSType.ANDROID;
    const buildPath = `${this.configService.get(
      'UPLOAD_PATH',
    )}/${buildType.toLowerCase()}/${file.filename}`;

    return new Promise((resolve, reject) => {
      exec(
        `node ./scripts/ipa-extractor ${buildPath}`,
        (err, stdout, stderr) => {
          if (err) {
            return reject(err);
          }
          if (stderr) {
            return reject(stderr);
          }

          const object = JSON.parse(stdout);

          resolve(object);
        },
      );
    });
  }

  async getManifestUrl(file: File, appId: String): Promise<string> {
    const osDir =
      extname(file.filename) === '.ipa' ? OSType.IOS : OSType.ANDROID;
    const buildId = file.filename.substring(0, file.filename.length - 4);

    if (extname(file.filename) !== '.ipa') {
      return file.filename;
    }

    const manifestPath = `${buildId}_manifest.plist`;

    return new Promise(resolve => {
      this.generateManifestFromIPA(file, appId).then(plist => {
        fs.writeFileSync(
          `${this.configService.get(
            'UPLOAD_PATH',
          )}/${osDir.toLowerCase()}/${manifestPath}`,
          plist,
        );

        resolve(manifestPath);
      });
    });
  }

  /**
   * Upload build to server
   * @param {UploadPayload} file the user given username to fetch
   * @returns {Promise<IUser>} queried user data
   */
  @Post('/upload')
  // @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 200, description: 'Upload build request success' })
  @ApiResponse({ status: 400, description: 'Upload build request failed' })
  async uploadBuild(@UploadedFile() file, @Req() req: any) {
    const build = new CreateBuildDTO();
    const info = await this.getAppInfo(file);
    const id = file.filename.substring(0, file.filename.length - 4);

    build._id = id;
    build.size = file.size;
    build.note = '';
    build.type =
      extname(file.originalname) === '.ipa' ? OSType.IOS : OSType.ANDROID;
    build.info = info;

    await this.getManifestUrl(file, info.appId);

    const response = await this.buildService.create(build);

    return {
      err: false,
      payload: `${this.configService.get('APP_URL')}/d/${response.id}`
    }
  }
}

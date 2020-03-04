import { Module, BadRequestException } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Build } from './build.model';
import { BuildController } from './build.controller';
import { BuildService } from './build.service';
import { multerOptions } from '@app/config/multer.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Build', schema: Build }]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptions,
      inject: [ConfigService],
    }),
  ],
  providers: [BuildService],
  exports: [BuildService],
  controllers: [BuildController],
})
export class BuildModule {}

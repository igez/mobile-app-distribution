import { join } from 'path';
import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule } from '@app/modules/auth/auth.module';
import { database, jwt } from '@app/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuildModule } from '@app/modules/build';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, jwt],
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '../../../../', 'client'),
    // }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          uri: configService.get('DB_URL'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as MongooseModuleAsyncOptions),
    }),
    AuthModule,
    BuildModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './user.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: User }])],
  providers: [UserService],
  exports: [UserService],
  controllers: [],
})
export class UserModule {}

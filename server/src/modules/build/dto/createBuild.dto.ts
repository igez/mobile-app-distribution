import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDecimal,
  IsString,
  IsOptional,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateBuildInfoDTO {
  @IsOptional()
  @IsString()
  appId: String;

  @IsOptional()
  @IsString()
  appName: String;

  @IsOptional()
  @IsString()
  buildNumber: String;

  @IsOptional()
  @IsString()
  version: String;

  @IsOptional()
  @IsString()
  thumbnail: String;
}

export class CreateBuildDTO {
  /**
   * Url
   */
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  _id: ObjectId;

  /**
   * Type
   */
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  type: string;

  /**
   * Size
   */
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  size: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  info: CreateBuildInfoDTO;

  /**
   * Note
   */
  @IsOptional()
  @IsString()
  note: string;
}

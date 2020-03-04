import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { BuildEntity } from './build.model';
import { CreateBuildDTO } from './dto/createBuild.dto';

/**
 * User Service
 */
@Injectable()
export class BuildService {
  /**
   * Constructor
   * @param {Model<BuildEntity>} buildModel
   */
  constructor(
    @InjectModel('Build') private readonly buildModel: Model<BuildEntity>,
  ) {}

  async create(payload: CreateBuildDTO): Promise<BuildEntity> {
    const build = new this.buildModel(payload);

    return build.save();
  }

  async getById(id: string): Promise<BuildEntity> {
    return await this.buildModel.findById(id).exec();
  }
}

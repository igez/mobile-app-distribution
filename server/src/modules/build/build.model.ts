import { Schema, Document } from 'mongoose';

export enum OSType {
  IOS = 'iOS',
  ANDROID = 'Android',
}

// export class iOSManifest {
//   appId: string;
//   size: number;
//   ipaUrl: string;
//   plistUrl: string;
// }

// Build model
/**
 * name
 * comment
 * createdAt
 * userId
 * ios: iOSManifest
 * android: AndroidManifest
 */

/**
 * Mongoose Build Schema
 */
export const Build = new Schema({
  type: { type: OSType, required: true },
  size: String,
  thumbnail: String,
  note: String,
  info: {
    type: {
      appId: { type: String, required: true },
      appname: { type: String, required: true },
      buildNumber: { type: String, required: true },
      version: { type: String, required: true },
      thumbnail: { type: String, required: true },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Mongoose Build Document
 */
export class BuildEntity extends Document {
  /**
   * UUID
   */
  readonly _id: Schema.Types.ObjectId;
  /**
   * Name
   */
  name: string;
  /**
   * URL
   */
  url: string;
  /**
   * type (OS)
   */
  type: OSType;
  /**
   * Name
   */
  size: string;
  /**
   * Thumbnail
   */
  thumbnail: string;
  /**
   * Note
   */
  note: string;
  /**
   * createdAt
   */
  createdAt: Date;

  info: any;
}

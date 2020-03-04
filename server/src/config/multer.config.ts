import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';

// Multer upload options
export const multerOptions = (config: ConfigService) => ({
  // Enable file size limits
  limits: {
    fileSize: +config.get('UPLOAD_MAX_SIZE'),
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (['.ipa', '.apk'].indexOf(extname(file.originalname)) !== -1) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  // Storage properties
  storage: diskStorage({
    // Destination storage path details
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = config.get('UPLOAD_PATH');
      const folderByOS =
        extname(file.originalname) === '.ipa' ? '/ios' : '/android';

      // Create folder if doesn't exist
      if (!existsSync(uploadPath + folderByOS)) {
        mkdirSync(uploadPath + folderByOS);
      }

      cb(null, uploadPath + folderByOS);
    },
    // File modification details
    filename: (req: any, file: any, cb: any) => {
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${new ObjectId()}${extname(file.originalname)}`);
    },
  }),
});

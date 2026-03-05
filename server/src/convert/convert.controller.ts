import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConvertService } from './convert.service';
import { Response, Request } from 'express';
import * as path from 'path';

@Controller()
export class ConvertController {

  constructor(private readonly convertService: ConvertService) {}

  @Post('convert')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp',
        filename: (req, file, cb) => {
          const unique =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + path.extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async convert(
    @UploadedFile() file: Express.Multer.File,
    @Body('conversionType') conversionType: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const inputPath = file.path;
    const forceOcr = req.query.forceOcr === 'true';
    console.log('FORCE OCR:', forceOcr);
    try {
      const result = await this.convertService.convert(
  inputPath,
  forceOcr,
);

console.log('RESULT:', result);

// Nếu là scan và chưa force OCR
if (result.type === 'scan' && !forceOcr) {
  return res.status(200).json({
    needOcr: true,
    message:
      'File là PDF scan. Bạn có muốn dùng OCR để convert không? Layout có thể không giữ nguyên.',
  });
}

// Nếu convert thành công
if (result.type === 'success') {
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' +
      path.basename(result.outputPath),
  );

  return res.sendFile(path.resolve(result.outputPath));
}

throw new Error('Unknown conversion result');
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Conversion failed');
    }
  }
}
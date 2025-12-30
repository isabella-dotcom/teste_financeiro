import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadResult } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('accounts-payable')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAccountsPayable(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    return this.uploadService.uploadAccountsPayable(file);
  }

  @Post('accounts-receivable')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAccountsReceivable(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    return this.uploadService.uploadAccountsReceivable(file);
  }
}


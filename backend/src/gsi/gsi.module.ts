import { Module } from '@nestjs/common';
import { GsiService } from './gsi.service';
import { GsiController } from './gsi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GsiController],
  providers: [GsiService],
  exports: [GsiService],
})
export class GsiModule {}


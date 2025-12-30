import { PartialType } from '@nestjs/mapped-types';
import { CreateGSIItemDto } from './create-gsi-item.dto';

export class UpdateGSIItemDto extends PartialType(CreateGSIItemDto) {}


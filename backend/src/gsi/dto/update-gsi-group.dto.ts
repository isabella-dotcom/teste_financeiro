import { PartialType } from '@nestjs/mapped-types';
import { CreateGSIGroupDto } from './create-gsi-group.dto';

export class UpdateGSIGroupDto extends PartialType(CreateGSIGroupDto) {}


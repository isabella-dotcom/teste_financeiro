import { PartialType } from '@nestjs/mapped-types';
import { CreateGSISubgroupDto } from './create-gsi-subgroup.dto';

export class UpdateGSISubgroupDto extends PartialType(CreateGSISubgroupDto) {}


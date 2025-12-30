import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GsiService } from './gsi.service';
import { CreateGSIGroupDto } from './dto/create-gsi-group.dto';
import { UpdateGSIGroupDto } from './dto/update-gsi-group.dto';
import { CreateGSISubgroupDto } from './dto/create-gsi-subgroup.dto';
import { UpdateGSISubgroupDto } from './dto/update-gsi-subgroup.dto';
import { CreateGSIItemDto } from './dto/create-gsi-item.dto';
import { UpdateGSIItemDto } from './dto/update-gsi-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gsi')
@UseGuards(JwtAuthGuard)
export class GsiController {
  constructor(private readonly gsiService: GsiService) {}

  // Groups
  @Post('groups')
  createGroup(@Body() createDto: CreateGSIGroupDto) {
    return this.gsiService.createGroup(createDto);
  }

  @Get('groups')
  findAllGroups() {
    return this.gsiService.findAllGroups();
  }

  @Get('groups/:id')
  findGroupById(@Param('id') id: string) {
    return this.gsiService.findGroupById(id);
  }

  @Patch('groups/:id')
  updateGroup(@Param('id') id: string, @Body() updateDto: UpdateGSIGroupDto) {
    return this.gsiService.updateGroup(id, updateDto);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string) {
    return this.gsiService.deleteGroup(id);
  }

  // Subgroups
  @Post('subgroups')
  createSubgroup(@Body() createDto: CreateGSISubgroupDto) {
    return this.gsiService.createSubgroup(createDto);
  }

  @Get('subgroups')
  findAllSubgroups(@Query('groupId') groupId?: string) {
    return this.gsiService.findAllSubgroups(groupId);
  }

  @Get('subgroups/:id')
  findSubgroupById(@Param('id') id: string) {
    return this.gsiService.findSubgroupById(id);
  }

  @Patch('subgroups/:id')
  updateSubgroup(@Param('id') id: string, @Body() updateDto: UpdateGSISubgroupDto) {
    return this.gsiService.updateSubgroup(id, updateDto);
  }

  @Delete('subgroups/:id')
  deleteSubgroup(@Param('id') id: string) {
    return this.gsiService.deleteSubgroup(id);
  }

  // Items
  @Post('items')
  createItem(@Body() createDto: CreateGSIItemDto) {
    return this.gsiService.createItem(createDto);
  }

  @Get('items')
  findAllItems(@Query('subgroupId') subgroupId?: string) {
    return this.gsiService.findAllItems(subgroupId);
  }

  @Get('items/:id')
  findItemById(@Param('id') id: string) {
    return this.gsiService.findItemById(id);
  }

  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() updateDto: UpdateGSIItemDto) {
    return this.gsiService.updateItem(id, updateDto);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.gsiService.deleteItem(id);
  }
}


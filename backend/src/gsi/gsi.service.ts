import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGSIGroupDto } from './dto/create-gsi-group.dto';
import { UpdateGSIGroupDto } from './dto/update-gsi-group.dto';
import { CreateGSISubgroupDto } from './dto/create-gsi-subgroup.dto';
import { UpdateGSISubgroupDto } from './dto/update-gsi-subgroup.dto';
import { CreateGSIItemDto } from './dto/create-gsi-item.dto';
import { UpdateGSIItemDto } from './dto/update-gsi-item.dto';

@Injectable()
export class GsiService {
  constructor(private prisma: PrismaService) {}

  // Groups
  async createGroup(createDto: CreateGSIGroupDto) {
    return this.prisma.gSIGroup.create({
      data: createDto,
    });
  }

  async findAllGroups() {
    return this.prisma.gSIGroup.findMany({
      include: {
        subgroups: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async findGroupById(id: string) {
    const group = await this.prisma.gSIGroup.findUnique({
      where: { id },
      include: {
        subgroups: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Grupo GSI não encontrado');
    }

    return group;
  }

  async updateGroup(id: string, updateDto: UpdateGSIGroupDto) {
    await this.findGroupById(id);
    return this.prisma.gSIGroup.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteGroup(id: string) {
    await this.findGroupById(id);
    return this.prisma.gSIGroup.delete({
      where: { id },
    });
  }

  // Subgroups
  async createSubgroup(createDto: CreateGSISubgroupDto) {
    return this.prisma.gSISubgroup.create({
      data: createDto,
      include: {
        group: true,
        items: true,
      },
    });
  }

  async findAllSubgroups(groupId?: string) {
    return this.prisma.gSISubgroup.findMany({
      where: groupId ? { groupId } : undefined,
      include: {
        group: true,
        items: true,
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async findSubgroupById(id: string) {
    const subgroup = await this.prisma.gSISubgroup.findUnique({
      where: { id },
      include: {
        group: true,
        items: true,
      },
    });

    if (!subgroup) {
      throw new NotFoundException('Subgrupo GSI não encontrado');
    }

    return subgroup;
  }

  async updateSubgroup(id: string, updateDto: UpdateGSISubgroupDto) {
    await this.findSubgroupById(id);
    return this.prisma.gSISubgroup.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteSubgroup(id: string) {
    await this.findSubgroupById(id);
    return this.prisma.gSISubgroup.delete({
      where: { id },
    });
  }

  // Items
  async createItem(createDto: CreateGSIItemDto) {
    return this.prisma.gSIItem.create({
      data: createDto,
      include: {
        subgroup: {
          include: {
            group: true,
          },
        },
      },
    });
  }

  async findAllItems(subgroupId?: string) {
    return this.prisma.gSIItem.findMany({
      where: subgroupId ? { subgroupId } : undefined,
      include: {
        subgroup: {
          include: {
            group: true,
          },
        },
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async findItemById(id: string) {
    const item = await this.prisma.gSIItem.findUnique({
      where: { id },
      include: {
        subgroup: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item GSI não encontrado');
    }

    return item;
  }

  async updateItem(id: string, updateDto: UpdateGSIItemDto) {
    await this.findItemById(id);
    return this.prisma.gSIItem.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteItem(id: string) {
    await this.findItemById(id);
    return this.prisma.gSIItem.delete({
      where: { id },
    });
  }
}


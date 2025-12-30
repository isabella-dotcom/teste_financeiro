import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Injectable()
export class BankService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateBankDto) {
    return this.prisma.bank.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.bank.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const bank = await this.prisma.bank.findUnique({
      where: { id },
    });

    if (!bank) {
      throw new NotFoundException('Banco não encontrado');
    }

    return bank;
  }

  async update(id: string, updateDto: UpdateBankDto) {
    await this.findOne(id);
    return this.prisma.bank.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.bank.delete({
      where: { id },
    });
  }
}


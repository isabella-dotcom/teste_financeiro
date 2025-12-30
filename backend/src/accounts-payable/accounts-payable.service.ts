import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PayAccountsPayableDto } from './dto/pay-accounts-payable.dto';
import { AccountsPayableStatus } from '../common/enums';

@Injectable()
export class AccountsPayableService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAccountsPayableDto) {
    return this.prisma.accountsPayable.create({
      data: createDto,
      include: {
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        bank: true,
        person: true,
      },
    });
  }

  async findAll(filters?: {
    status?: AccountsPayableStatus;
    bankId?: string;
    gsiItemId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.accountsPayable.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.bankId && { bankId: filters.bankId }),
        ...(filters?.gsiItemId && { gsiItemId: filters.gsiItemId }),
        ...(filters?.startDate || filters?.endDate
          ? {
              dataVencimento: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      },
      include: {
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        bank: true,
        person: true,
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.accountsPayable.findUnique({
      where: { id },
      include: {
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        bank: true,
        person: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta a pagar não encontrada');
    }

    return account;
  }

  async update(id: string, updateDto: UpdateAccountsPayableDto) {
    await this.findOne(id);
    return this.prisma.accountsPayable.update({
      where: { id },
      data: updateDto,
      include: {
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        bank: true,
        person: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.accountsPayable.delete({
      where: { id },
    });
  }

  async pay(id: string, payDto: PayAccountsPayableDto) {
    const account = await this.findOne(id);

    if (account.status === AccountsPayableStatus.PAGO) {
      throw new BadRequestException('Conta já está paga');
    }

    if (account.status === AccountsPayableStatus.CANCELADO) {
      throw new BadRequestException('Conta cancelada não pode ser paga');
    }

    return this.prisma.accountsPayable.update({
      where: { id },
      data: {
        status: AccountsPayableStatus.PAGO,
        dataPagamento: payDto.dataPagamento || new Date(),
        formaPagamento: payDto.formaPagamento,
        observacao: payDto.observacao,
      },
      include: {
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        bank: true,
        person: true,
      },
    });
  }

  async payBatch(ids: string[], payDto: PayAccountsPayableDto) {
    const accounts = await this.prisma.accountsPayable.findMany({
      where: {
        id: { in: ids },
        status: { not: AccountsPayableStatus.CANCELADO },
      },
    });

    if (accounts.length === 0) {
      throw new BadRequestException('Nenhuma conta válida encontrada');
    }

    return this.prisma.accountsPayable.updateMany({
      where: {
        id: { in: ids },
        status: { not: AccountsPayableStatus.CANCELADO },
      },
      data: {
        status: AccountsPayableStatus.PAGO,
        dataPagamento: payDto.dataPagamento || new Date(),
        formaPagamento: payDto.formaPagamento,
        observacao: payDto.observacao,
      },
    });
  }
}


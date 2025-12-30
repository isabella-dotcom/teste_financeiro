import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountsReceivableDto } from './dto/create-accounts-receivable.dto';
import { UpdateAccountsReceivableDto } from './dto/update-accounts-receivable.dto';
import { ReceiveAccountsReceivableDto } from './dto/receive-accounts-receivable.dto';
import { AccountsReceivableStatus } from '@prisma/client';

@Injectable()
export class AccountsReceivableService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAccountsReceivableDto) {
    return this.prisma.accountsReceivable.create({
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
    status?: AccountsReceivableStatus;
    bankId?: string;
    gsiItemId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.accountsReceivable.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.bankId && { bankId: filters.bankId }),
        ...(filters?.gsiItemId && { gsiItemId: filters.gsiItemId }),
        ...(filters?.startDate || filters?.endDate
          ? {
              dataPrevista: {
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
      orderBy: { dataPrevista: 'asc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.accountsReceivable.findUnique({
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
      throw new NotFoundException('Conta a receber não encontrada');
    }

    return account;
  }

  async update(id: string, updateDto: UpdateAccountsReceivableDto) {
    await this.findOne(id);
    return this.prisma.accountsReceivable.update({
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
    return this.prisma.accountsReceivable.delete({
      where: { id },
    });
  }

  async receive(id: string, receiveDto: ReceiveAccountsReceivableDto) {
    const account = await this.findOne(id);

    if (account.status === AccountsReceivableStatus.RECEBIDO && account.valorRecebido >= account.valorPrevisto) {
      throw new BadRequestException('Conta já está totalmente recebida');
    }

    if (account.status === AccountsReceivableStatus.GLOSADO) {
      throw new BadRequestException('Conta glosada não pode ser recebida');
    }

    const newValorRecebido = Number(account.valorRecebido) + Number(receiveDto.valorRecebido);
    const valorGlosa = receiveDto.valorGlosa ? Number(receiveDto.valorGlosa) : Number(account.valorGlosa);
    const valorPrevisto = Number(account.valorPrevisto);

    let newStatus: AccountsReceivableStatus;
    if (valorGlosa > 0) {
      newStatus = AccountsReceivableStatus.GLOSADO;
    } else if (newValorRecebido >= valorPrevisto) {
      newStatus = AccountsReceivableStatus.RECEBIDO;
    } else if (newValorRecebido > 0) {
      newStatus = AccountsReceivableStatus.PARCIAL;
    } else {
      newStatus = AccountsReceivableStatus.ABERTO;
    }

    return this.prisma.accountsReceivable.update({
      where: { id },
      data: {
        valorRecebido: newValorRecebido,
        valorGlosa: valorGlosa,
        status: newStatus,
        dataRecebimento: receiveDto.dataRecebimento || new Date(),
        observacao: receiveDto.observacao,
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
}


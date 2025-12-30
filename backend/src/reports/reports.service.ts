import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsPayableStatus, AccountsReceivableStatus } from '../common/enums';
import * as XLSX from 'xlsx';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getPaidAccountsByBank(filters: {
    startDate?: Date;
    endDate?: Date;
    bankId?: string;
    gsiItemId?: string;
  }) {
    return this.prisma.accountsPayable.findMany({
      where: {
        status: AccountsPayableStatus.PAGO,
        ...(filters.bankId && { bankId: filters.bankId }),
        ...(filters.gsiItemId && { gsiItemId: filters.gsiItemId }),
        ...(filters.startDate || filters.endDate
          ? {
              dataPagamento: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      },
      include: {
        bank: true,
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        person: true,
      },
      orderBy: { dataPagamento: 'desc' },
    });
  }

  async getPayableAccountsByBank(filters: {
    startDate?: Date;
    endDate?: Date;
    bankId?: string;
    gsiItemId?: string;
    status?: AccountsPayableStatus;
  }) {
    return this.prisma.accountsPayable.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.bankId && { bankId: filters.bankId }),
        ...(filters.gsiItemId && { gsiItemId: filters.gsiItemId }),
        ...(filters.startDate || filters.endDate
          ? {
              dataVencimento: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      },
      include: {
        bank: true,
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        person: true,
      },
      orderBy: { dataVencimento: 'asc' },
    });
  }

  async getReceivableAccountsByBank(filters: {
    startDate?: Date;
    endDate?: Date;
    bankId?: string;
    gsiItemId?: string;
    status?: AccountsReceivableStatus;
  }) {
    return this.prisma.accountsReceivable.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.bankId && { bankId: filters.bankId }),
        ...(filters.gsiItemId && { gsiItemId: filters.gsiItemId }),
        ...(filters.startDate || filters.endDate
          ? {
              dataPrevista: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      },
      include: {
        bank: true,
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
        person: true,
      },
      orderBy: { dataPrevista: 'asc' },
    });
  }

  async getGlosasByPeriod(filters: {
    startDate?: Date;
    endDate?: Date;
    personId?: string;
  }) {
    return this.prisma.accountsReceivable.findMany({
      where: {
        status: AccountsReceivableStatus.GLOSADO,
        valorGlosa: { gt: 0 },
        ...(filters.personId && { personId: filters.personId }),
        ...(filters.startDate || filters.endDate
          ? {
              dataRecebimento: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      },
      include: {
        person: true,
        bank: true,
        gsiItem: {
          include: {
            subgroup: {
              include: {
                group: true,
              },
            },
          },
        },
      },
      orderBy: { dataRecebimento: 'desc' },
    });
  }

  async getCashFlow(filters: {
    startDate?: Date;
    endDate?: Date;
    bankId?: string;
  }) {
    const payables = await this.prisma.accountsPayable.findMany({
      where: {
        ...(filters.bankId && { bankId: filters.bankId }),
        ...(filters.startDate || filters.endDate
          ? {
              OR: [
                {
                  dataVencimento: {
                    ...(filters.startDate && { gte: filters.startDate }),
                    ...(filters.endDate && { lte: filters.endDate }),
                  },
                },
                {
                  dataPagamento: {
                    ...(filters.startDate && { gte: filters.startDate }),
                    ...(filters.endDate && { lte: filters.endDate }),
                  },
                },
              ],
            }
          : {}),
      },
      include: { bank: true },
    });

    const receivables = await this.prisma.accountsReceivable.findMany({
      where: {
        ...(filters.bankId && { bankId: filters.bankId }),
        ...(filters.startDate || filters.endDate
          ? {
              OR: [
                {
                  dataPrevista: {
                    ...(filters.startDate && { gte: filters.startDate }),
                    ...(filters.endDate && { lte: filters.endDate }),
                  },
                },
                {
                  dataRecebimento: {
                    ...(filters.startDate && { gte: filters.startDate }),
                    ...(filters.endDate && { lte: filters.endDate }),
                  },
                },
              ],
            }
          : {}),
      },
      include: { bank: true },
    });

    return {
      payables,
      receivables,
      totalPayable: payables.reduce((sum, p) => sum + Number(p.valor), 0),
      totalPaid: payables
        .filter((p) => p.status === AccountsPayableStatus.PAGO)
        .reduce((sum, p) => sum + Number(p.valor), 0),
      totalReceivable: receivables.reduce((sum, r) => sum + Number(r.valorPrevisto), 0),
      totalReceived: receivables.reduce((sum, r) => sum + Number(r.valorRecebido), 0),
      totalGlosa: receivables.reduce((sum, r) => sum + Number(r.valorGlosa), 0),
    };
  }

  async exportToExcel(data: any[], filename: string): Promise<Buffer> {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }
}


import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { AccountsPayableStatus, AccountsReceivableStatus, AccountsReceivableOrigem, PersonType } from '../common/enums';

export interface UploadResult {
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: any[];
}

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async uploadAccountsPayable(file: Express.Multer.File): Promise<UploadResult> {
    const data = await this.parseFile(file);
    const result: UploadResult = {
      totalRows: data.length,
      successRows: 0,
      errorRows: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Validar e mapear dados
        const gsiItem = await this.findOrCreateGSIItem(row);
        const bank = await this.findOrCreateBank(row);
        const person = await this.findOrCreatePerson(row, PersonType.FORNECEDOR);

        await this.prisma.accountsPayable.create({
          data: {
            gsiItemId: gsiItem.id,
            bankId: bank.id,
            personId: person.id,
            descricao: row.descricao || row.descricao || 'Importado via planilha',
            valor: parseFloat(row.valor || row.valor || '0'),
            dataVencimento: this.parseDate(row.dataVencimento || row.data_vencimento || row['data vencimento']),
            status: this.parseStatus(row.status) || AccountsPayableStatus.ABERTO,
            formaPagamento: row.formaPagamento || row.forma_pagamento,
            observacao: row.observacao || row.observação,
          },
        });

        result.successRows++;
      } catch (error) {
        result.errorRows++;
        result.errors.push({
          row: i + 2, // +2 porque linha 1 é header e arrays começam em 0
          error: error.message,
          data: row,
        });
      }
    }

    await this.prisma.uploadLog.create({
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        totalRows: result.totalRows,
        successRows: result.successRows,
        errorRows: result.errorRows,
        errors: result.errors,
      },
    });

    return result;
  }

  async uploadAccountsReceivable(file: Express.Multer.File): Promise<UploadResult> {
    const data = await this.parseFile(file);
    const result: UploadResult = {
      totalRows: data.length,
      successRows: 0,
      errorRows: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const gsiItem = await this.findOrCreateGSIItem(row);
        const bank = await this.findOrCreateBank(row);
        const origem = this.parseOrigem(row.origem || row.origem || 'PACIENTE');
        const personType = origem === AccountsReceivableOrigem.CONVENIO ? PersonType.CONVENIO : PersonType.PACIENTE;
        const person = await this.findOrCreatePerson(row, personType);

        await this.prisma.accountsReceivable.create({
          data: {
            gsiItemId: gsiItem.id,
            bankId: bank.id,
            personId: person.id,
            origem: origem,
            valorPrevisto: parseFloat(row.valorPrevisto || row.valor_previsto || row.valor || '0'),
            valorRecebido: parseFloat(row.valorRecebido || row.valor_recebido || '0'),
            valorGlosa: parseFloat(row.valorGlosa || row.valor_glosa || '0'),
            status: this.parseReceivableStatus(row.status) || AccountsReceivableStatus.ABERTO,
            dataPrevista: this.parseDate(row.dataPrevista || row.data_prevista || row['data prevista']),
            observacao: row.observacao || row.observação,
          },
        });

        result.successRows++;
      } catch (error) {
        result.errorRows++;
        result.errors.push({
          row: i + 2,
          error: error.message,
          data: row,
        });
      }
    }

    await this.prisma.uploadLog.create({
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        totalRows: result.totalRows,
        successRows: result.successRows,
        errorRows: result.errorRows,
        errors: result.errors,
      },
    });

    return result;
  }

  private async parseFile(file: Express.Multer.File): Promise<any[]> {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      return parse(file.buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx')
    ) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } else {
      throw new BadRequestException('Formato de arquivo não suportado. Use CSV ou XLSX.');
    }
  }

  private async findOrCreateGSIItem(row: any) {
    const codigo = row.gsiCodigo || row.gsi_codigo || row.codigo_gsi || '01.01.001';
    const nome = row.gsiNome || row.gsi_nome || row.nome_gsi || 'Item GSI';

    let item = await this.prisma.gSIItem.findFirst({
      where: { codigo },
    });

    if (!item) {
      // Criar grupo, subgrupo e item se não existirem
      const groupCodigo = codigo.split('.')[0];
      let group = await this.prisma.gSIGroup.findFirst({
        where: { codigo: groupCodigo },
      });

      if (!group) {
        group = await this.prisma.gSIGroup.create({
          data: {
            codigo: groupCodigo,
            nome: `Grupo ${groupCodigo}`,
            descricao: 'Criado automaticamente via importação',
          },
        });
      }

      const subgroupCodigo = `${codigo.split('.')[0]}.${codigo.split('.')[1]}`;
      let subgroup = await this.prisma.gSISubgroup.findFirst({
        where: { codigo: subgroupCodigo, groupId: group.id },
      });

      if (!subgroup) {
        subgroup = await this.prisma.gSISubgroup.create({
          data: {
            groupId: group.id,
            codigo: subgroupCodigo,
            nome: `Subgrupo ${subgroupCodigo}`,
            descricao: 'Criado automaticamente via importação',
          },
        });
      }

      item = await this.prisma.gSIItem.create({
        data: {
          subgroupId: subgroup.id,
          codigo: codigo,
          nome: nome,
          descricao: 'Criado automaticamente via importação',
        },
      });
    }

    return item;
  }

  private async findOrCreateBank(row: any) {
    const nome = row.banco || row.bank || row.bancoNome || 'Banco Padrão';
    const codigo = row.bancoCodigo || row.bank_codigo || '001';

    let bank = await this.prisma.bank.findFirst({
      where: { codigo },
    });

    if (!bank) {
      bank = await this.prisma.bank.create({
        data: {
          nome,
          codigo,
          agencia: row.agencia || '0001',
          conta: row.conta || '00000000',
          tipo: row.tipoConta || row.tipo_conta || 'CORRENTE',
        },
      });
    }

    return bank;
  }

  private async findOrCreatePerson(row: any, tipo: PersonType) {
    const nome = row.fornecedor || row.pessoa || row.nome || row.person || 'Pessoa Padrão';
    const documento = row.documento || row.cnpj || row.cpf || null;

    let person = await this.prisma.person.findFirst({
      where: { nome, tipo },
    });

    if (!person) {
      person = await this.prisma.person.create({
        data: {
          tipo,
          nome,
          documento,
        },
      });
    }

    return person;
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    
    // Tentar diferentes formatos
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Formato brasileiro DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    
    return new Date();
  }

  private parseStatus(status: string): AccountsPayableStatus | null {
    if (!status) return null;
    const upper = status.toUpperCase();
    if (upper === 'PAGO' || upper === 'PAGO') return AccountsPayableStatus.PAGO;
    if (upper === 'CANCELADO' || upper === 'CANCELADO') return AccountsPayableStatus.CANCELADO;
    return AccountsPayableStatus.ABERTO;
  }

  private parseReceivableStatus(status: string): AccountsReceivableStatus | null {
    if (!status) return null;
    const upper = status.toUpperCase();
    if (upper === 'RECEBIDO' || upper === 'RECEBIDO') return AccountsReceivableStatus.RECEBIDO;
    if (upper === 'PARCIAL' || upper === 'PARCIAL') return AccountsReceivableStatus.PARCIAL;
    if (upper === 'GLOSADO' || upper === 'GLOSADO') return AccountsReceivableStatus.GLOSADO;
    return AccountsReceivableStatus.ABERTO;
  }

  private parseOrigem(origem: string): AccountsReceivableOrigem {
    if (!origem) return AccountsReceivableOrigem.PACIENTE;
    const upper = origem.toUpperCase();
    if (upper === 'CONVENIO' || upper === 'CONVÊNIO') return AccountsReceivableOrigem.CONVENIO;
    if (upper === 'ENCONTRO_CONTAS' || upper === 'ENCONTRO CONTAS') return AccountsReceivableOrigem.ENCONTRO_CONTAS;
    return AccountsReceivableOrigem.PACIENTE;
  }
}


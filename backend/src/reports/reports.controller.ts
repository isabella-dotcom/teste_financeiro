import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsPayableStatus, AccountsReceivableStatus } from '../common/enums';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('paid-accounts-by-bank')
  async getPaidAccountsByBank(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('gsiItemId') gsiItemId?: string,
    @Query('export') exportToExcel?: string,
    @Res() res?: Response,
  ) {
    const data = await this.reportsService.getPaidAccountsByBank({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bankId,
      gsiItemId,
    });

    if (exportToExcel === 'true' && res) {
      const excel = await this.reportsService.exportToExcel(
        data.map((item) => ({
          Banco: item.bank.nome,
          'Código GSI': item.gsiItem.codigo,
          'Item GSI': item.gsiItem.nome,
          Fornecedor: item.person.nome,
          Descrição: item.descricao,
          Valor: Number(item.valor),
          'Data Vencimento': item.dataVencimento,
          'Data Pagamento': item.dataPagamento,
          'Forma Pagamento': item.formaPagamento,
          Status: item.status,
        })),
        'contas-pagas',
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=contas-pagas.xlsx');
      return res.send(excel);
    }

    return data;
  }

  @Get('payable-accounts-by-bank')
  async getPayableAccountsByBank(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('gsiItemId') gsiItemId?: string,
    @Query('status') status?: AccountsPayableStatus,
    @Query('export') exportToExcel?: string,
    @Res() res?: Response,
  ) {
    const data = await this.reportsService.getPayableAccountsByBank({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bankId,
      gsiItemId,
      status,
    });

    if (exportToExcel === 'true' && res) {
      const excel = await this.reportsService.exportToExcel(
        data.map((item) => ({
          Banco: item.bank.nome,
          'Código GSI': item.gsiItem.codigo,
          'Item GSI': item.gsiItem.nome,
          Fornecedor: item.person.nome,
          Descrição: item.descricao,
          Valor: Number(item.valor),
          'Data Vencimento': item.dataVencimento,
          Status: item.status,
        })),
        'contas-a-pagar',
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=contas-a-pagar.xlsx');
      return res.send(excel);
    }

    return data;
  }

  @Get('receivable-accounts-by-bank')
  async getReceivableAccountsByBank(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
    @Query('gsiItemId') gsiItemId?: string,
    @Query('status') status?: AccountsReceivableStatus,
    @Query('export') exportToExcel?: string,
    @Res() res?: Response,
  ) {
    const data = await this.reportsService.getReceivableAccountsByBank({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bankId,
      gsiItemId,
      status,
    });

    if (exportToExcel === 'true' && res) {
      const excel = await this.reportsService.exportToExcel(
        data.map((item) => ({
          Banco: item.bank.nome,
          'Código GSI': item.gsiItem.codigo,
          'Item GSI': item.gsiItem.nome,
          Pessoa: item.person.nome,
          Origem: item.origem,
          'Valor Previsto': Number(item.valorPrevisto),
          'Valor Recebido': Number(item.valorRecebido),
          'Valor Glosa': Number(item.valorGlosa),
          'Data Prevista': item.dataPrevista,
          'Data Recebimento': item.dataRecebimento,
          Status: item.status,
        })),
        'contas-a-receber',
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=contas-a-receber.xlsx');
      return res.send(excel);
    }

    return data;
  }

  @Get('glosas')
  async getGlosas(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('personId') personId?: string,
    @Query('export') exportToExcel?: string,
    @Res() res?: Response,
  ) {
    const data = await this.reportsService.getGlosasByPeriod({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      personId,
    });

    if (exportToExcel === 'true' && res) {
      const excel = await this.reportsService.exportToExcel(
        data.map((item) => ({
          Convênio: item.person.nome,
          'Código GSI': item.gsiItem.codigo,
          'Item GSI': item.gsiItem.nome,
          'Valor Previsto': Number(item.valorPrevisto),
          'Valor Recebido': Number(item.valorRecebido),
          'Valor Glosa': Number(item.valorGlosa),
          'Data Recebimento': item.dataRecebimento,
          Observação: item.observacao,
        })),
        'glosas',
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=glosas.xlsx');
      return res.send(excel);
    }

    return data;
  }

  @Get('cash-flow')
  async getCashFlow(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('bankId') bankId?: string,
  ) {
    return this.reportsService.getCashFlow({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      bankId,
    });
  }
}


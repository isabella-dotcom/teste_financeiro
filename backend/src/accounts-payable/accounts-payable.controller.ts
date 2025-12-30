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
import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { PayAccountsPayableDto } from './dto/pay-accounts-payable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsPayableStatus } from '@prisma/client';

@Controller('accounts-payable')
@UseGuards(JwtAuthGuard)
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) {}

  @Post()
  create(@Body() createDto: CreateAccountsPayableDto) {
    return this.accountsPayableService.create(createDto);
  }

  @Get()
  findAll(
    @Query('status') status?: AccountsPayableStatus,
    @Query('bankId') bankId?: string,
    @Query('gsiItemId') gsiItemId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountsPayableService.findAll({
      status,
      bankId,
      gsiItemId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsPayableService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAccountsPayableDto) {
    return this.accountsPayableService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsPayableService.remove(id);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Body() payDto: PayAccountsPayableDto) {
    return this.accountsPayableService.pay(id, payDto);
  }

  @Post('pay-batch')
  payBatch(@Body() body: { ids: string[]; data: PayAccountsPayableDto }) {
    return this.accountsPayableService.payBatch(body.ids, body.data);
  }
}


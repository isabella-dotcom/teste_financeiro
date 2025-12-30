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
import { AccountsReceivableService } from './accounts-receivable.service';
import { CreateAccountsReceivableDto } from './dto/create-accounts-receivable.dto';
import { UpdateAccountsReceivableDto } from './dto/update-accounts-receivable.dto';
import { ReceiveAccountsReceivableDto } from './dto/receive-accounts-receivable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsReceivableStatus } from '../common/enums';

@Controller('accounts-receivable')
@UseGuards(JwtAuthGuard)
export class AccountsReceivableController {
  constructor(private readonly accountsReceivableService: AccountsReceivableService) {}

  @Post()
  create(@Body() createDto: CreateAccountsReceivableDto) {
    return this.accountsReceivableService.create(createDto);
  }

  @Get()
  findAll(
    @Query('status') status?: AccountsReceivableStatus,
    @Query('bankId') bankId?: string,
    @Query('gsiItemId') gsiItemId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountsReceivableService.findAll({
      status,
      bankId,
      gsiItemId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsReceivableService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAccountsReceivableDto) {
    return this.accountsReceivableService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsReceivableService.remove(id);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() receiveDto: ReceiveAccountsReceivableDto) {
    return this.accountsReceivableService.receive(id, receiveDto);
  }
}


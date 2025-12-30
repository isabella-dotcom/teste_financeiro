import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { AccountsReceivableStatus, AccountsReceivableOrigem } from '@prisma/client';

export class CreateAccountsReceivableDto {
  @IsUUID()
  gsiItemId: string;

  @IsUUID()
  bankId: string;

  @IsUUID()
  personId: string;

  @IsEnum(AccountsReceivableOrigem)
  origem: AccountsReceivableOrigem;

  @IsNumber()
  valorPrevisto: number;

  @IsNumber()
  @IsOptional()
  valorRecebido?: number;

  @IsNumber()
  @IsOptional()
  valorGlosa?: number;

  @IsEnum(AccountsReceivableStatus)
  @IsOptional()
  status?: AccountsReceivableStatus;

  @IsDateString()
  dataPrevista: string;

  @IsDateString()
  @IsOptional()
  dataRecebimento?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}


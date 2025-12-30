import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { AccountsPayableStatus } from '@prisma/client';

export class CreateAccountsPayableDto {
  @IsUUID()
  gsiItemId: string;

  @IsUUID()
  bankId: string;

  @IsUUID()
  personId: string;

  @IsString()
  descricao: string;

  @IsNumber()
  valor: number;

  @IsDateString()
  dataVencimento: string;

  @IsEnum(AccountsPayableStatus)
  @IsOptional()
  status?: AccountsPayableStatus;

  @IsDateString()
  @IsOptional()
  dataPagamento?: string;

  @IsString()
  @IsOptional()
  formaPagamento?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}


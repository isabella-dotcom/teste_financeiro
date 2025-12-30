import { IsString, IsOptional, IsDateString } from 'class-validator';

export class PayAccountsPayableDto {
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


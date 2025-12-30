import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class ReceiveAccountsReceivableDto {
  @IsNumber()
  valorRecebido: number;

  @IsNumber()
  @IsOptional()
  valorGlosa?: number;

  @IsDateString()
  @IsOptional()
  dataRecebimento?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}


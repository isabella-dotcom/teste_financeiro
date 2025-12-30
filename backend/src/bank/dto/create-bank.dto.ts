import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBankDto {
  @IsString()
  nome: string;

  @IsString()
  codigo: string;

  @IsString()
  agencia: string;

  @IsString()
  conta: string;

  @IsString()
  tipo: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}


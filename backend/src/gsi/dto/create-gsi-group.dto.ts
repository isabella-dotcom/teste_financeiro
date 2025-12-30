import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateGSIGroupDto {
  @IsString()
  codigo: string;

  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}


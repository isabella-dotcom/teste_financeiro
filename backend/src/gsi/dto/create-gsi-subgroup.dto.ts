import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateGSISubgroupDto {
  @IsUUID()
  groupId: string;

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


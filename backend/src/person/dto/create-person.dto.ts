import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PersonType } from '../../common/enums';

export class CreatePersonDto {
  @IsEnum(PersonType)
  tipo: PersonType;

  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  documento?: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}


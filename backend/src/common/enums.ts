// Enums compartilhados para evitar problemas de importação do Prisma Client durante build

export enum AccountsReceivableOrigem {
  PACIENTE = 'PACIENTE',
  CONVENIO = 'CONVENIO',
  ENCONTRO_CONTAS = 'ENCONTRO_CONTAS',
}

export enum AccountsReceivableStatus {
  ABERTO = 'ABERTO',
  RECEBIDO = 'RECEBIDO',
  PARCIAL = 'PARCIAL',
  GLOSADO = 'GLOSADO',
}

export enum AccountsPayableStatus {
  ABERTO = 'ABERTO',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

export enum PersonType {
  PACIENTE = 'PACIENTE',
  FORNECEDOR = 'FORNECEDOR',
  CONVENIO = 'CONVENIO',
  MEDICO = 'MEDICO',
}


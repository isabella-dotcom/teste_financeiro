import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário padrão
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@hucm.com' },
    update: {},
    create: {
      email: 'admin@hucm.com',
      password: hashedPassword,
      name: 'Administrador',
    },
  });
  console.log('✅ Usuário criado:', user.email);

  // Criar grupos GSI
  const group1 = await prisma.gSIGroup.upsert({
    where: { codigo: '01' },
    update: {},
    create: {
      codigo: '01',
      nome: 'Despesas Operacionais',
      descricao: 'Grupo de despesas operacionais do hospital',
      ativo: true,
    },
  });

  const group2 = await prisma.gSIGroup.upsert({
    where: { codigo: '02' },
    update: {},
    create: {
      codigo: '02',
      nome: 'Receitas Operacionais',
      descricao: 'Grupo de receitas operacionais do hospital',
      ativo: true,
    },
  });

  console.log('✅ Grupos GSI criados');

  // Criar subgrupos GSI
  const subgroup1 = await prisma.gSISubgroup.upsert({
    where: { codigo: '01.01' },
    update: {},
    create: {
      groupId: group1.id,
      codigo: '01.01',
      nome: 'Fornecedores',
      descricao: 'Subgrupo de fornecedores',
      ativo: true,
    },
  });

  const subgroup2 = await prisma.gSISubgroup.upsert({
    where: { codigo: '01.02' },
    update: {},
    create: {
      groupId: group1.id,
      codigo: '01.02',
      nome: 'Serviços',
      descricao: 'Subgrupo de serviços',
      ativo: true,
    },
  });

  const subgroup3 = await prisma.gSISubgroup.upsert({
    where: { codigo: '02.01' },
    update: {},
    create: {
      groupId: group2.id,
      codigo: '02.01',
      nome: 'Atendimentos',
      descricao: 'Subgrupo de atendimentos',
      ativo: true,
    },
  });

  console.log('✅ Subgrupos GSI criados');

  // Criar itens GSI
  const item1 = await prisma.gSIItem.upsert({
    where: { codigo: '01.01.001' },
    update: {},
    create: {
      subgroupId: subgroup1.id,
      codigo: '01.01.001',
      nome: 'Material Médico',
      descricao: 'Itens de material médico',
      ativo: true,
    },
  });

  const item2 = await prisma.gSIItem.upsert({
    where: { codigo: '01.01.002' },
    update: {},
    create: {
      subgroupId: subgroup1.id,
      codigo: '01.01.002',
      nome: 'Material de Limpeza',
      descricao: 'Itens de material de limpeza',
      ativo: true,
    },
  });

  const item3 = await prisma.gSIItem.upsert({
    where: { codigo: '01.02.001' },
    update: {},
    create: {
      subgroupId: subgroup2.id,
      codigo: '01.02.001',
      nome: 'Serviços de Manutenção',
      descricao: 'Serviços de manutenção predial',
      ativo: true,
    },
  });

  const item4 = await prisma.gSIItem.upsert({
    where: { codigo: '02.01.001' },
    update: {},
    create: {
      subgroupId: subgroup3.id,
      codigo: '02.01.001',
      nome: 'Consultas',
      descricao: 'Receitas de consultas médicas',
      ativo: true,
    },
  });

  console.log('✅ Itens GSI criados');

  // Criar bancos
  const bank1 = await prisma.bank.upsert({
    where: { codigo: '001' },
    update: {},
    create: {
      nome: 'Banco do Brasil',
      codigo: '001',
      agencia: '1234-5',
      conta: '12345-6',
      tipo: 'CORRENTE',
      ativo: true,
    },
  });

  const bank2 = await prisma.bank.upsert({
    where: { codigo: '237' },
    update: {},
    create: {
      nome: 'Bradesco',
      codigo: '237',
      agencia: '5678-9',
      conta: '67890-1',
      tipo: 'CORRENTE',
      ativo: true,
    },
  });

  console.log('✅ Bancos criados');

  // Criar pessoas
  const fornecedor1 = await prisma.person.upsert({
    where: { id: 'fornecedor-1' },
    update: {},
    create: {
      id: 'fornecedor-1',
      tipo: 'FORNECEDOR',
      nome: 'Fornecedor de Materiais Médicos LTDA',
      documento: '12.345.678/0001-90',
      observacao: 'Fornecedor principal de materiais médicos',
    },
  });

  const fornecedor2 = await prisma.person.upsert({
    where: { id: 'fornecedor-2' },
    update: {},
    create: {
      id: 'fornecedor-2',
      tipo: 'FORNECEDOR',
      nome: 'Limpeza e Higiene SA',
      documento: '98.765.432/0001-10',
    },
  });

  const convenio1 = await prisma.person.upsert({
    where: { id: 'convenio-1' },
    update: {},
    create: {
      id: 'convenio-1',
      tipo: 'CONVENIO',
      nome: 'Unimed',
      documento: '11.222.333/0001-44',
    },
  });

  const convenio2 = await prisma.person.upsert({
    where: { id: 'convenio-2' },
    update: {},
    create: {
      id: 'convenio-2',
      tipo: 'CONVENIO',
      nome: 'Amil',
      documento: '22.333.444/0001-55',
    },
  });

  const paciente1 = await prisma.person.upsert({
    where: { id: 'paciente-1' },
    update: {},
    create: {
      id: 'paciente-1',
      tipo: 'PACIENTE',
      nome: 'João Silva',
      documento: '123.456.789-00',
    },
  });

  const medico1 = await prisma.person.upsert({
    where: { id: 'medico-1' },
    update: {},
    create: {
      id: 'medico-1',
      tipo: 'MEDICO',
      nome: 'Dr. Carlos Santos',
      documento: 'CRM 12345',
    },
  });

  console.log('✅ Pessoas criadas');

  // Criar contas a pagar
  const ap1 = await prisma.accountsPayable.create({
    data: {
      gsiItemId: item1.id,
      bankId: bank1.id,
      personId: fornecedor1.id,
      descricao: 'Compra de material médico - Janeiro',
      valor: 15000.00,
      dataVencimento: new Date('2024-02-15'),
      status: 'ABERTO',
    },
  });

  const ap2 = await prisma.accountsPayable.create({
    data: {
      gsiItemId: item2.id,
      bankId: bank1.id,
      personId: fornecedor2.id,
      descricao: 'Material de limpeza - Janeiro',
      valor: 5000.00,
      dataVencimento: new Date('2024-02-10'),
      status: 'PAGO',
      dataPagamento: new Date('2024-02-08'),
      formaPagamento: 'PIX',
    },
  });

  const ap3 = await prisma.accountsPayable.create({
    data: {
      gsiItemId: item3.id,
      bankId: bank2.id,
      personId: fornecedor1.id,
      descricao: 'Manutenção do sistema de ar condicionado',
      valor: 8000.00,
      dataVencimento: new Date('2024-02-20'),
      status: 'ABERTO',
    },
  });

  console.log('✅ Contas a pagar criadas');

  // Criar contas a receber
  const ar1 = await prisma.accountsReceivable.create({
    data: {
      gsiItemId: item4.id,
      bankId: bank1.id,
      personId: convenio1.id,
      origem: 'CONVENIO',
      valorPrevisto: 25000.00,
      valorRecebido: 25000.00,
      valorGlosa: 0,
      status: 'RECEBIDO',
      dataPrevista: new Date('2024-02-05'),
      dataRecebimento: new Date('2024-02-03'),
    },
  });

  const ar2 = await prisma.accountsReceivable.create({
    data: {
      gsiItemId: item4.id,
      bankId: bank1.id,
      personId: convenio2.id,
      origem: 'CONVENIO',
      valorPrevisto: 30000.00,
      valorRecebido: 28000.00,
      valorGlosa: 2000.00,
      status: 'GLOSADO',
      dataPrevista: new Date('2024-02-10'),
      dataRecebimento: new Date('2024-02-08'),
    },
  });

  const ar3 = await prisma.accountsReceivable.create({
    data: {
      gsiItemId: item4.id,
      bankId: bank2.id,
      personId: paciente1.id,
      origem: 'PACIENTE',
      valorPrevisto: 500.00,
      valorRecebido: 0,
      valorGlosa: 0,
      status: 'ABERTO',
      dataPrevista: new Date('2024-02-25'),
    },
  });

  console.log('✅ Contas a receber criadas');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


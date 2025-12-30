# Sistema Financeiro HUCM

Sistema financeiro web completo desenvolvido com NestJS (backend) e React (frontend).

## 🚀 Tecnologias

### Backend
- **Node.js** + **NestJS**
- **Prisma ORM** + **PostgreSQL**
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **XLSX** e **CSV** para processamento de planilhas

### Frontend
- **React** + **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (componentes)
- **TanStack Table** (tabelas)
- **Recharts** (gráficos)
- **React Router** (roteamento)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado e rodando
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório (se aplicável)

```bash
cd "SISTEMA FINANCEIRO HUCM"
```

### 2. Instale as dependências

```bash
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### 3. Configure o banco de dados

1. Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE sistema_financeiro;
```

2. Configure a variável de ambiente no backend:

```bash
cd backend
cp .env.example .env
```

3. Edite o arquivo `.env` e configure a `DATABASE_URL`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sistema_financeiro?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 4. Execute as migrações

```bash
cd backend
npx prisma migrate dev
```

### 5. Execute o seed (dados iniciais)

```bash
cd backend
npm run prisma:seed
```

Isso criará:
- Usuário padrão: `admin@hucm.com` / `admin123`
- Grupos, subgrupos e itens GSI
- Bancos de exemplo
- Pessoas (fornecedores, convênios, pacientes, médicos)
- Contas a pagar e receber de exemplo

## 🏃 Executando o Projeto

### Backend

```bash
cd backend
npm run start:dev
```

O backend estará disponível em: `http://localhost:3000`

### Frontend

Em um novo terminal:

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 📚 Estrutura do Projeto

```
SISTEMA FINANCEIRO HUCM/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.ts            # Seed com dados iniciais
│   ├── src/
│   │   ├── auth/              # Módulo de autenticação
│   │   ├── gsi/               # Módulo GSI (Plano Financeiro)
│   │   ├── bank/              # Módulo de Bancos
│   │   ├── person/            # Módulo de Pessoas
│   │   ├── accounts-payable/   # Contas a Pagar
│   │   ├── accounts-receivable/ # Contas a Receber
│   │   ├── upload/            # Upload de planilhas
│   │   ├── reports/           # Relatórios
│   │   └── prisma/            # Serviço Prisma
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Componentes React
    │   │   ├── ui/            # Componentes Shadcn/ui
    │   │   └── Layout.tsx      # Layout principal
    │   ├── contexts/          # Contextos React
    │   ├── lib/               # Utilitários
    │   ├── pages/             # Páginas da aplicação
    │   └── App.tsx            # Componente principal
    └── package.json
```

## 🎯 Funcionalidades

### 1. GSI (Plano Financeiro)
- ✅ CRUD completo de Grupos, Subgrupos e Itens
- ✅ Estrutura hierárquica (Grupo → Subgrupo → Item)
- ✅ Códigos únicos para cada nível

### 2. Bancos
- ✅ CRUD completo
- ✅ Gestão de contas bancárias

### 3. Pessoas
- ✅ CRUD completo
- ✅ Tipos: Paciente, Fornecedor, Convênio, Médico
- ✅ Filtros por tipo

### 4. Contas a Pagar
- ✅ CRUD completo
- ✅ Baixa manual de contas
- ✅ Baixa em lote
- ✅ Upload via planilha (Excel/CSV)
- ✅ Status: ABERTO, PAGO, CANCELADO

### 5. Contas a Receber
- ✅ CRUD completo
- ✅ Baixa total ou parcial
- ✅ Registro de glosas
- ✅ Upload via planilha
- ✅ Status: ABERTO, RECEBIDO, PARCIAL, GLOSADO
- ✅ Origem: PACIENTE, CONVENIO, ENCONTRO_CONTAS

### 6. Upload de Planilhas
- ✅ Suporte para XLSX e CSV
- ✅ Validação de dados
- ✅ Criação automática de registros relacionados (GSI, Bancos, Pessoas)
- ✅ Log de importação

### 7. Relatórios
- ✅ Contas Pagas por Banco
- ✅ Contas a Pagar por Banco
- ✅ Contas a Receber por Banco
- ✅ Glosas por Período e Convênio
- ✅ Fluxo de Caixa
- ✅ Exportação para Excel

### 8. Dashboard
- ✅ Cards com resumo financeiro
- ✅ Gráficos de fluxo de caixa
- ✅ Comparativos visuais

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Após fazer login, o token é armazenado no localStorage e enviado automaticamente em todas as requisições.

**Credenciais padrão:**
- Email: `admin@hucm.com`
- Senha: `admin123`

## 📊 Modelo de Dados

### GSI (Plano Financeiro)
- **GSIGroup**: Grupos principais (ex: 01)
- **GSISubgroup**: Subgrupos (ex: 01.02)
- **GSIItem**: Itens específicos (ex: 01.02.003)

### Contas a Pagar
- Vinculadas a: GSI Item, Banco, Fornecedor
- Campos: valor, data vencimento, status, data pagamento, forma pagamento

### Contas a Receber
- Vinculadas a: GSI Item, Banco, Pessoa
- Campos: valor previsto, valor recebido, valor glosa, origem, status

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run start:dev      # Desenvolvimento
npm run build          # Build para produção
npm run start:prod     # Executar produção
npm run prisma:generate # Gerar Prisma Client
npm run prisma:migrate  # Executar migrações
npm run prisma:seed     # Executar seed
npm run prisma:studio   # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev            # Desenvolvimento
npm run build          # Build para produção
npm run preview        # Preview da build
```

## 📝 API Endpoints

### Autenticação
- `POST /auth/login` - Login

### GSI
- `GET /gsi/groups` - Listar grupos
- `POST /gsi/groups` - Criar grupo
- `PATCH /gsi/groups/:id` - Atualizar grupo
- `DELETE /gsi/groups/:id` - Deletar grupo
- (Mesmos endpoints para `/gsi/subgroups` e `/gsi/items`)

### Bancos
- `GET /banks` - Listar bancos
- `POST /banks` - Criar banco
- `PATCH /banks/:id` - Atualizar banco
- `DELETE /banks/:id` - Deletar banco

### Pessoas
- `GET /persons` - Listar pessoas
- `POST /persons` - Criar pessoa
- `PATCH /persons/:id` - Atualizar pessoa
- `DELETE /persons/:id` - Deletar pessoa

### Contas a Pagar
- `GET /accounts-payable` - Listar contas
- `POST /accounts-payable` - Criar conta
- `PATCH /accounts-payable/:id` - Atualizar conta
- `DELETE /accounts-payable/:id` - Deletar conta
- `POST /accounts-payable/:id/pay` - Dar baixa
- `POST /accounts-payable/pay-batch` - Baixa em lote

### Contas a Receber
- `GET /accounts-receivable` - Listar contas
- `POST /accounts-receivable` - Criar conta
- `PATCH /accounts-receivable/:id` - Atualizar conta
- `DELETE /accounts-receivable/:id` - Deletar conta
- `POST /accounts-receivable/:id/receive` - Receber conta

### Upload
- `POST /upload/accounts-payable` - Upload de contas a pagar
- `POST /upload/accounts-receivable` - Upload de contas a receber

### Relatórios
- `GET /reports/paid-accounts-by-bank` - Contas pagas
- `GET /reports/payable-accounts-by-bank` - Contas a pagar
- `GET /reports/receivable-accounts-by-bank` - Contas a receber
- `GET /reports/glosas` - Glosas
- `GET /reports/cash-flow` - Fluxo de caixa

Adicione `?export=true` aos endpoints de relatórios para exportar em Excel.

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no arquivo `.env`
- Verifique as credenciais do banco

### Erro ao executar migrações
```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset
```

### Erro no frontend
- Verifique se o backend está rodando na porta 3000
- Limpe o cache: `npm run build` e depois `npm run dev`

## 📄 Licença

Este projeto foi desenvolvido para o Sistema Financeiro HUCM.

## 👨‍💻 Desenvolvimento

Para contribuir ou fazer alterações:

1. Crie uma branch para sua feature
2. Faça suas alterações
3. Teste localmente
4. Commit e push

---

**Desenvolvido com ❤️ para HUCM**


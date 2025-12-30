# 🚀 Guia de Deploy no Vercel

## Configurações Necessárias

### 1. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

- `DATABASE_URL`: URL de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (ex: uma string aleatória longa)
- `JWT_EXPIRES_IN`: Tempo de expiração (ex: `7d`)
- `PORT`: Porta (opcional, Vercel define automaticamente)

### 2. Build Settings

No painel do Vercel, configure:

- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Comandos de Build

O Vercel executará automaticamente:
1. `npm install` - Instala dependências
2. `npx prisma generate` - Gera o Prisma Client
3. `npm run build` - Compila o projeto NestJS

### 4. Migrations

**IMPORTANTE**: Execute as migrations no banco de dados antes do deploy:

```bash
# Localmente ou em um servidor
cd backend
npx prisma migrate deploy
```

Ou configure um script no Vercel para executar migrations automaticamente.

### 5. Seed (Opcional)

Se quiser popular o banco automaticamente:

```bash
cd backend
npm run prisma:seed
```

## Estrutura de Arquivos

Certifique-se de que a estrutura está assim:

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Troubleshooting

### Erro: "Module '@prisma/client' has no exported member"

**Solução**: Certifique-se de que `npx prisma generate` está sendo executado antes do build.

### Erro: "Cannot find module '@nestjs/mapped-types'"

**Solução**: A dependência já foi adicionada ao `package.json`. Certifique-se de que `npm install` está sendo executado.

### Erro de conexão com banco

**Solução**: Verifique se a `DATABASE_URL` está configurada corretamente no Vercel e se o banco permite conexões externas.

## Comandos Úteis

```bash
# Verificar build localmente
cd backend
npm install
npx prisma generate
npm run build

# Testar produção localmente
npm run start:prod
```

## Notas Importantes

1. O Vercel usa Node.js 18.x por padrão
2. Certifique-se de que todas as dependências estão no `package.json`
3. O Prisma Client deve ser gerado durante o build
4. Configure CORS adequadamente para permitir requisições do frontend


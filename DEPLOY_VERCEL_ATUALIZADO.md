# 🚀 Guia de Deploy no Vercel - Atualizado

## Estrutura do Projeto

O projeto agora está configurado com:
- `api/index.ts` na raiz - Handler serverless para o Vercel
- `vercel.json` - Configuração do Vercel
- `backend/` - Código do backend NestJS

## Configurações no Vercel

### 1. Variáveis de Ambiente

Configure no painel do Vercel (Settings > Environment Variables):

- `DATABASE_URL`: URL de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (ex: uma string aleatória longa)
- `JWT_EXPIRES_IN`: Tempo de expiração (ex: `7d`)
- `FRONTEND_URL`: URL do seu frontend (para CORS) - opcional
- `CORS_ORIGIN`: Alternativa ao FRONTEND_URL - opcional

### 2. Build Settings

No painel do Vercel (Settings > General):

- **Framework Preset**: Other
- **Root Directory**: `/` (raiz do projeto)
- **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
- **Output Directory**: (deixe vazio)
- **Install Command**: `cd backend && npm install`

**OU** use o arquivo `vercel.json` que já está configurado na raiz do projeto.

### 3. Estrutura de Arquivos

```
.
├── api/
│   └── index.ts          # Handler serverless
├── backend/
│   ├── src/
│   ├── prisma/
│   └── package.json
├── vercel.json           # Configuração do Vercel
└── tsconfig.json         # Configuração TypeScript
```

## Como Funciona

1. O Vercel detecta o arquivo `api/index.ts` como uma função serverless
2. O `vercel.json` configura o build do backend e as rotas
3. Todas as requisições são redirecionadas para `/api` que executa o handler NestJS
4. O handler inicializa o NestJS uma vez e reutiliza a instância (cache)

## Testando o Deploy

Após o deploy, teste as rotas:

- `https://seu-projeto.vercel.app/auth/login`
- `https://seu-projeto.vercel.app/gsi/groups`
- `https://seu-projeto.vercel.app/banks`
- `https://seu-projeto.vercel.app/persons`

## Troubleshooting

### Erro 404: NOT_FOUND

1. Verifique se o build foi bem-sucedido nos logs do Vercel
2. Certifique-se de que `api/index.ts` existe na raiz
3. Verifique se o `vercel.json` está na raiz do projeto
4. Verifique se todas as variáveis de ambiente estão configuradas

### Erro de CORS

Configure a variável `FRONTEND_URL` ou `CORS_ORIGIN` no Vercel com a URL do seu frontend.

### Erro de banco de dados

1. Verifique se `DATABASE_URL` está configurada corretamente
2. Certifique-se de que o banco permite conexões do Vercel
3. Execute as migrations: `npx prisma migrate deploy`

### Erro: "Cannot find module"

1. Verifique se o build do backend foi executado com sucesso
2. Certifique-se de que `npx prisma generate` foi executado
3. Verifique os logs de build no Vercel

## Comandos Úteis

```bash
# Testar build localmente
cd backend
npm install
npx prisma generate
npm run build

# Verificar estrutura
ls -la api/
cat vercel.json
```

## Notas Importantes

1. O Vercel usa Node.js 18.x por padrão
2. O Prisma Client deve ser gerado durante o build
3. O handler usa cache para melhor performance
4. Todas as rotas do NestJS estão disponíveis através do handler


# 🔧 Correção do Erro 404 no Vercel

## Problema
O Vercel estava retornando erro 404 porque não encontrava as rotas da aplicação NestJS.

## Solução Aplicada

### 1. Criado Handler Serverless
- Arquivo `backend/api/index.ts` criado como entry point para o Vercel
- Handler serverless que inicializa o NestJS uma vez e reutiliza a instância

### 2. Configuração do Vercel
- `vercel.json` atualizado para apontar para o handler correto
- Rotas configuradas para capturar todas as requisições

### 3. CORS Ajustado
- CORS agora aceita variável de ambiente `FRONTEND_URL` ou `CORS_ORIGIN`
- Permite configuração dinâmica no Vercel

## Configurações no Vercel

### Variáveis de Ambiente
Configure no painel do Vercel:

1. **DATABASE_URL**: URL do PostgreSQL
2. **JWT_SECRET**: Chave secreta para JWT
3. **JWT_EXPIRES_IN**: `7d` (opcional)
4. **FRONTEND_URL**: URL do seu frontend (para CORS)
5. **CORS_ORIGIN**: Alternativa ao FRONTEND_URL

### Build Settings

No painel do Vercel, configure:

- **Framework Preset**: Other
- **Root Directory**: (deixe vazio ou `/`)
- **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
- **Output Directory**: (deixe vazio)
- **Install Command**: `cd backend && npm install`

### Ou use o arquivo vercel.json

O arquivo `vercel.json` na raiz já está configurado. O Vercel deve detectá-lo automaticamente.

## Estrutura de Arquivos

```
.
├── vercel.json          # Configuração do Vercel
├── backend/
│   ├── api/
│   │   └── index.ts     # Handler serverless
│   ├── src/
│   ├── prisma/
│   └── package.json
```

## Testando

Após o deploy, teste as rotas:

- `https://seu-projeto.vercel.app/auth/login`
- `https://seu-projeto.vercel.app/gsi/groups`
- `https://seu-projeto.vercel.app/banks`

## Troubleshooting

### Ainda recebendo 404?

1. Verifique se o build foi bem-sucedido
2. Verifique os logs do Vercel
3. Certifique-se de que `backend/api/index.ts` existe
4. Verifique se o `vercel.json` está na raiz do projeto

### Erro de CORS?

Configure a variável `FRONTEND_URL` no Vercel com a URL do seu frontend.

### Erro de banco de dados?

1. Verifique se `DATABASE_URL` está configurada
2. Certifique-se de que o banco permite conexões do Vercel
3. Execute as migrations: `npx prisma migrate deploy`


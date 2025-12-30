# 🚀 Guia para Subir o Projeto no Git

## Pré-requisitos

1. **Instalar Git** (se ainda não tiver):
   - Baixe em: https://git-scm.com/download/win
   - Ou use: `winget install Git.Git` (se tiver Windows Package Manager)

2. **Criar repositório no GitHub/GitLab/Bitbucket**:
   - Acesse sua plataforma preferida
   - Crie um novo repositório (pode ser privado ou público)
   - **NÃO** inicialize com README, .gitignore ou licença (já temos isso)

## 📋 Comandos para Executar

Abra o terminal na pasta do projeto e execute os comandos abaixo:

### 1. Inicializar o repositório Git

```bash
git init
```

### 2. Configurar seu nome e email (se ainda não configurou)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 3. Adicionar todos os arquivos

```bash
git add .
```

### 4. Fazer o commit inicial

```bash
git commit -m "feat: Sistema Financeiro HUCM - Implementação inicial completa

- Backend NestJS com Prisma e PostgreSQL
- Frontend React com Vite, TypeScript e Tailwind
- CRUD completo para GSI, Bancos, Pessoas, Contas a Pagar/Receber
- Upload de planilhas Excel/CSV
- Sistema de relatórios com exportação
- Autenticação JWT
- Dashboard com gráficos"
```

### 5. Adicionar o repositório remoto

Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelos seus dados:

**GitHub:**
```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

**GitLab:**
```bash
git remote add origin https://gitlab.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

**Bitbucket:**
```bash
git remote add origin https://bitbucket.org/SEU_USUARIO/SEU_REPOSITORIO.git
```

### 6. Renomear branch principal (se necessário)

```bash
git branch -M main
```

### 7. Fazer o push inicial

```bash
git push -u origin main
```

Se pedir credenciais:
- **GitHub**: Use um Personal Access Token (não a senha)
- **GitLab**: Use um Personal Access Token
- **Bitbucket**: Use App Password

## 🔐 Criar Personal Access Token (GitHub)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome (ex: "Sistema Financeiro HUCM")
4. Selecione escopos: `repo` (acesso completo aos repositórios)
5. Clique em "Generate token"
6. **Copie o token** (só aparece uma vez!)
7. Use o token como senha quando o Git pedir credenciais

## 📝 Próximos Commits

Para fazer commits futuros:

```bash
# Ver status
git status

# Adicionar arquivos alterados
git add .

# Ou adicionar arquivos específicos
git add caminho/do/arquivo

# Fazer commit
git commit -m "descrição das alterações"

# Enviar para o repositório
git push
```

## 🔄 Comandos Úteis

```bash
# Ver histórico de commits
git log

# Ver diferenças
git diff

# Ver branches
git branch

# Criar nova branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main

# Ver repositórios remotos
git remote -v
```

## ⚠️ Importante

- **NUNCA** commite arquivos `.env` (já está no .gitignore)
- **NUNCA** commite `node_modules` (já está no .gitignore)
- Sempre revise com `git status` antes de commitar
- Use mensagens de commit descritivas

## 🎯 Estrutura que será enviada

```
SISTEMA FINANCEIRO HUCM/
├── backend/          ✅ Será enviado
├── frontend/         ✅ Será enviado
├── README.md         ✅ Será enviado
├── .gitignore        ✅ Será enviado
└── package.json      ✅ Será enviado

❌ NÃO será enviado:
- node_modules/
- .env
- dist/
- build/
```

---

**Pronto!** Após executar esses comandos, seu projeto estará no Git! 🎉


# Easy Money

Plataforma moderna de gestão financeira pessoal — clareza, automação e insights visuais.

- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth
- **UI:** pt-BR, moeda BRL (R$ 1.500,00)
- **Arquitetura:** controllers → services → repositories

## Começar

```bash
# Instalar dependências
npm install

# Configurar ambiente (copiar e preencher)
cp .env.example .env

# Gerar Prisma Client (após configurar DATABASE_URL)
npm run db:generate

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run start`| Iniciar produção       |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:push`     | Sincronizar schema com o DB |
| `npm run db:migrate`  | Criar/aplicar migrações |
| `npm run db:studio`   | Abrir Prisma Studio   |

## Documentação

- [Arquitetura do produto](docs/ARCHITECTURE.md)

## Fases do projeto

1. ✅ Arquitetura e estrutura de pastas
2. Schema do banco (Prisma + PostgreSQL)
3. API backend
4. Autenticação (NextAuth)
5. Layout frontend + i18n
6. Dashboard
7. Módulos financeiros (receitas, despesas, orçamento)
8. Sistema de insights

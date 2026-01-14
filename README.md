# Sistema de Artigos

API REST para gerenciamento de artigos com autenticação JWT e controle de permissões baseado em roles.

## Stack

- **NestJS** + TypeScript
- **Prisma ORM** 
- **PostgreSQL 15**
- **JWT** para autenticação
- **Docker** para containerização

## Início Rápido

```bash
# Clone e entre no diretório
cd teste-ntt

# Inicie com Docker (recomendado)
docker-compose up -d

# Aguarde ~30s para migrations e seed
# API disponível em http://localhost:3000
# Swagger em http://localhost:3000/docs
```

## Documentação da API

Acesse a documentação interativa Swagger em: **http://localhost:3000/docs**

A documentação inclui:
- Todos os endpoints disponíveis
- Schemas de request/response
- Autenticação Bearer Token
- Teste interativo das rotas

## Autenticação

### Credenciais Padrão

```json
{
  "email": "root@admin.com",
  "password": "root123"
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root@admin.com","password":"root123"}'
```

### Usar o Token

```bash
curl http://localhost:3000/api/articles \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Permissões

| Role | Artigos | Usuários |
|------|---------|----------|
| **admin** | CRUD completo | CRUD completo |
| **editor** | CRUD completo | ❌ |
| **reader** | Apenas leitura | ❌ |

## Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+

### Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrations
npx prisma migrate dev

# Popular banco de dados
npm run prisma:seed

# Iniciar em modo desenvolvimento
npm run start:dev
```

### Scripts Úteis

```bash
npm run build          # Build para produção
npm run start:prod     # Iniciar produção
npm run prisma:studio  # Interface visual do banco
npm test               # Executar testes
```

## Estrutura do Projeto

```
src/
├── auth/          # Autenticação JWT
├── users/         # Gerenciamento de usuários
├── articles/      # Gerenciamento de artigos
└── prisma/        # Database service

prisma/
├── schema.prisma  # Schema do banco
├── migrations/    # Histórico de migrations
└── seed.ts        # Dados iniciais
```

## Endpoints Principais

| Método | Endpoint | Permissão | Descrição |
|--------|----------|-----------|-----------|
| POST | `/api/auth/login` | Público | Login |
| GET | `/api/users` | admin | Listar usuários |
| POST | `/api/users` | admin | Criar usuário |
| GET | `/api/articles` | Autenticado | Listar artigos |
| POST | `/api/articles` | editor, admin | Criar artigo |
| PUT | `/api/articles/:id` | editor, admin | Editar artigo |
| DELETE | `/api/articles/:id` | editor, admin | Deletar artigo |

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sistema_artigos"
JWT_SECRET="seu-secret-aqui"
JWT_EXPIRES_IN="24h"
PORT=3000
```

## Docker

```bash
# Iniciar serviços
docker-compose up -d

# Ver logs
docker logs sistema-artigos-app -f

# Parar serviços
docker-compose down

# Limpar volumes
docker-compose down -v
```

## Troubleshooting

**Porta 3000 já em uso:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Recriar banco de dados:**
```bash
docker-compose down -v
docker-compose up -d
```

**Ver logs de erro:**
```bash
docker logs sistema-artigos-app --tail 50
```



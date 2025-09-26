# 🧠 Task Manager Backend

Este é o backend da aplicação **Task Manager**, desenvolvido com **NestJS**, **TypeORM**, **Redis** e **PostgreSQL**.

## 📚 Documentação da API

A API possui documentação interativa gerada com **Swagger/OpenAPI**, disponível em:

```
http://localhost:3001/api
```

> Essa interface permite testar endpoints, visualizar parâmetros e entender a estrutura da API.

## 🚀 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/rafaelmatth/task-manager-backend.git
cd task-manager-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`.


### 4. Suba os serviços Redis e PostgreSQL com Docker

```bash
docker-compose up -d
```

> Isso iniciará os containers do Redis e PostgreSQL conforme definido no `docker-compose.yml`.

### 5. Execute as migrações do banco de dados
```bash
# Build do projeto e execução das migrações
npm run build
npx typeorm migration:run -d dist/database/data-source.js
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`.

## 📊 Migrações de Banco de Dados
O projeto usa **TypeORM Migrations** para controle de versão do schema do banco.

### Estrutura:
```
src/database/
├── data-source.ts          # Configuração TypeORM
├── migrations/             # Migrações (geradas automaticamente)
└── ormconfig.ts            # Configuração alternativa
```

### 🔧 Comandos de Migração:
Gerar migração:
```bash
npx typeorm migration:generate src/database/migrations/NomeDescricao -d dist/database/data-source.js
```

Executar migrações pendentes:
```bash
npx typeorm migration:run -d dist/database/data-source.js
```

Reverter última migração:
```bash
npx typeorm migration:revert -d dist/database/data-source.js
```

Ver status:
```bash
npx typeorm migration:show -d dist/database/data-source.js
```

### Scripts rápidos (`package.json`):
```bash
# Geração e execução automática
npm run db:migrate

# Apenas gerar migração
npm run migration:generate -- src/database/migrations/NovaFuncionalidade

# Apenas executar migrações pendentes
npm run migration:run

# Reverter última migração
npm run migration:revert
```

## 📋 Fluxo de Trabalho para Novas Funcionalidades
1. Modifique as entidades em `src/**/*.entity.ts`  
2. Execute:  
   ```bash
   npm run build
   ```
3. Gere migração:  
   ```bash
   npx typeorm migration:generate src/database/migrations/DescricaoAlteracao -d dist/database/data-source.js
   ```
4. Execute migração:  
   ```bash
   npx typeorm migration:run -d dist/database/data-source.js
   ```

## 🧰 Scripts disponíveis
- `npm run start:dev` — inicia o servidor com hot reload  
- `npm run build` — compila o projeto  
- `npm run test` — executa os testes unitários  
- `npm run test:e2e` — executa os testes end-to-end  
- `npm run lint` — aplica correções de lint  
- `npm run format` — formata o código com Prettier  
- `npm run type-check` — verifica os tipos TypeScript  

## 🔄 Reset do Ambiente de Desenvolvimento
Se precisar recriar o banco do zero:

```bash
# Parar e remover containers e volumes
docker-compose down -v

# Recriar serviços
docker-compose up -d

# Recriar schema public se necessário
docker-compose exec postgres psql -U taskuser -d taskmanager -c "CREATE SCHEMA IF NOT EXISTS public;"

# Executar migrações
npm run build
npx typeorm migration:run -d dist/database/data-source.js
```

## 🧪 Tecnologias utilizadas

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Swagger/OpenAPI](https://swagger.io/)
- [Passport + JWT](https://docs.nestjs.com/security/authentication)

---

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

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`. Exemplo:


### 4. Suba os serviços Redis e PostgreSQL com Docker

```bash
docker-compose up -d
```

> Isso iniciará os containers do Redis e PostgreSQL conforme definido no `docker-compose.yml`.

### 5. Inicie o servidor de desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

## 🧰 Scripts disponíveis

- `npm run start:dev` — inicia o servidor com hot reload
- `npm run build` — compila o projeto
- `npm run test` — executa os testes unitários
- `npm run test:e2e` — executa os testes end-to-end
- `npm run lint` — aplica correções de lint
- `npm run format` — formata o código com Prettier
- `npm run type-check` — verifica os tipos TypeScript

## 🧪 Tecnologias utilizadas

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Swagger/OpenAPI](https://swagger.io/)
- [Passport + JWT](https://docs.nestjs.com/security/authentication)

---

# api/ — API NestJS

Back-end do OPERATION: BETTER SELF (SAAS_PLAN.md §5). Projeto independente do front:
`package.json` próprio, mesmo repositório.

Estado: **H1 (esqueleto)**. Ainda não tem billing, webhook nem módulos de dados. O front
continua falando direto com o Supabase até a fase B do strangler (§5.5).

## Rodar

```bash
cd api
npm install
cp .env.example .env      # e preenche
npm run start:dev         # http://localhost:3000/health
```

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Sobe com watch |
| `npm run build` | Compila para `dist/` (`dist/api/src/main.js` + `dist/contracts/api.js`) |
| `npm run start:prod` | Roda o build |
| `npm test` | Vitest: unitários + e2e com Postgres em memória (PGlite), sem Docker |
| `npm run typecheck` | `tsc --noEmit`, inclui os testes e os `@ts-expect-error` |

Lint é o da raiz (`npm run lint` no repo inteiro já cobre `api/`).

## Estrutura

```
src/
  main.ts              rawBody (HMAC do webhook), CORS, shutdown hooks
  app.module.ts        filtro, interceptor e guard globais (APP_*)
  contracts.ts         re-export de ../contracts/api.ts — o contrato com o front
  core/config/         env validado com zod no boot (AppConfig)
  core/http/           ApiException, filtro de erro e envelope { ok, data | error }
  auth/                guard JWT global, @Public(), @UserId()
    ports/             AuthVerifier
    adapters/          SupabaseJwksAuthVerifier (jose + JWKS)
  db/                  Kysely sobre pg (token KYSELY)
  modules/health/      GET /health
test/
  support/             PGlite com stub do Supabase, emissor de JWT de teste, app de teste
```

## Regras

- **ESM.** Import relativo termina em `.js` (mesmo apontando para `.ts`), `import.meta.dirname`
  no lugar de `__dirname`, mocks são `vi.fn()`.
- **Toda rota exige JWT**, salvo `@Public()`. `userId` só vem de `@UserId()`, nunca do body.
- **Erro sai sempre por `ApiException(código, mensagem)`** com código do contrato. O que não for
  `ApiException` vira `INTERNAL` e o detalhe fica só no log.
- **Kysely só dentro de adapter** (e do health). Use case fala com port.
- **O JWT é validado pela chave pública (JWKS).** O projeto Supabase precisa de chave de
  assinatura assimétrica (Settings > JWT Keys). Com o segredo HS256 legado, o JWKS vem vazio
  e todo request dá 401.

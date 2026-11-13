import { Global, Inject, Injectable, Module, type OnApplicationShutdown } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { AppConfig } from '../core/config/app-config.js';
import { type Database, type Db, KYSELY } from './database.js';

/** Fecha o pool no shutdown (SIGTERM do deploy), senao o processo fica pendurado. */
@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(KYSELY) private readonly db: Db) {}

  async onApplicationShutdown(): Promise<void> {
    await this.db.destroy();
  }
}

/**
 * Adapter de Postgres: Kysely (query builder tipado) sobre `pg`, com a connection string
 * do Supabase — SQL puro, nao PostgREST (SAAS_PLAN §5.3). Trocar Supabase por qualquer
 * Postgres = trocar DATABASE_URL.
 *
 * O pool so conecta no primeiro uso: a API sobe mesmo com o banco fora do ar, e o
 * /health mostra `db: down`.
 */
@Global()
@Module({
  providers: [
    {
      provide: KYSELY,
      inject: [AppConfig],
      useFactory: (config: AppConfig): Db =>
        new Kysely<Database>({
          dialect: new PostgresDialect({
            pool: new pg.Pool({
              connectionString: config.databaseUrl,
              max: 10,
              // Sem isso, host inalcancavel pendura o request indefinidamente.
              connectionTimeoutMillis: 5_000,
              idleTimeoutMillis: 30_000,
            }),
          }),
        }),
    },
    DatabaseLifecycle,
  ],
  exports: [KYSELY],
})
export class DatabaseModule {}

import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'kysely';
import { Public } from '../../auth/decorators.js';
import { type Db, KYSELY } from '../../db/database.js';

export type HealthStatus = {
  status: 'ok' | 'degraded';
  db: 'up' | 'down';
};

/**
 * Checagem de vida para a hospedagem (H2). Responde 200 mesmo com o banco fora: banco
 * caido nao se resolve reiniciando a API, e um healthcheck que derruba o container por
 * isso so gera loop de restart. O estado do banco vai no corpo.
 *
 * Infra, nao produto: fica fora do contracts/api.ts, que lista o que o FRONT chama.
 */
@Public()
@Controller('health')
export class HealthController {
  constructor(@Inject(KYSELY) private readonly db: Db) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const db = await this.pingDb();
    return { status: db === 'up' ? 'ok' : 'degraded', db };
  }

  private async pingDb(): Promise<HealthStatus['db']> {
    try {
      await sql`select 1`.execute(this.db);
      return 'up';
    } catch {
      return 'down';
    }
  }
}

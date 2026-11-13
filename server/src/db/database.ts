import type { Kysely } from 'kysely';

/**
 * Tipos das tabelas que a API le/escreve, no formato do Kysely. Cada modulo acrescenta
 * as suas quando passar a usar (H4: billing; H7: habits, runs, workouts...). Fonte da
 * verdade do schema continua sendo supabase/migrations/ — isto so espelha.
 *
 * Mesmo motivo do database.types.ts do front: `type`, nunca `interface`.
 */
export type Database = Record<string, never>;

export type Db = Kysely<Database>;

/**
 * Token de injecao do Kysely. Usado SO dentro de adapters (`modules/<x>/adapters/postgres`)
 * e infraestrutura (health). Use case e controller falam com o port, nunca com o Kysely
 * (SAAS_PLAN §5.1) — e o que deixa trocar de banco escrevendo so adapter novo.
 */
export const KYSELY = Symbol('Kysely');

import { z } from 'zod';

const csv = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.url(),
  CORS_ORIGINS: csv,
  SUPABASE_URL: z.url(),
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, 'precisa comecar com postgres:// ou postgresql://'),
});

/**
 * Config tipada e validada no boot. Variavel faltando ou invalida derruba a API na
 * subida com a lista do que esta errado — nunca no primeiro request.
 *
 * E uma classe (e nao so um type) para servir de token de injecao: `constructor(private
 * config: AppConfig)`.
 */
export class AppConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly appUrl: string;
  readonly corsOrigins: string[];
  readonly supabaseUrl: string;
  readonly databaseUrl: string;

  /** Emissor que o Supabase Auth grava no `iss` do JWT. */
  get jwtIssuer(): string {
    return `${this.supabaseUrl}/auth/v1`;
  }

  get jwksUrl(): string {
    return `${this.jwtIssuer}/.well-known/jwks.json`;
  }

  private constructor(env: z.infer<typeof envSchema>) {
    this.nodeEnv = env.NODE_ENV;
    this.port = env.PORT;
    this.appUrl = stripSlash(env.APP_URL);
    this.corsOrigins = [this.appUrl, ...env.CORS_ORIGINS.map(stripSlash)];
    this.supabaseUrl = stripSlash(env.SUPABASE_URL);
    this.databaseUrl = env.DATABASE_URL;
  }

  static fromEnv(env: NodeJS.ProcessEnv): AppConfig {
    const parsed = envSchema.safeParse(env);
    if (!parsed.success) {
      const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
      throw new Error(`Config invalida (ver api/.env.example):\n${lines.join('\n')}`);
    }
    return new AppConfig(parsed.data);
  }
}

function stripSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

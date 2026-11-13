import { AppConfig } from './app-config.js';

const valid = {
  APP_URL: 'https://better-self.app/',
  SUPABASE_URL: 'https://abc.supabase.co/',
  DATABASE_URL: 'postgresql://postgres:x@db.abc.supabase.co:5432/postgres',
};

describe('AppConfig', () => {
  it('aplica defaults e tira a barra final das URLs', () => {
    const c = AppConfig.fromEnv(valid);
    expect(c.nodeEnv).toBe('development');
    expect(c.port).toBe(3000);
    expect(c.appUrl).toBe('https://better-self.app');
    expect(c.jwtIssuer).toBe('https://abc.supabase.co/auth/v1');
    expect(c.jwksUrl).toBe('https://abc.supabase.co/auth/v1/.well-known/jwks.json');
  });

  it('CORS = APP_URL + origens extras', () => {
    const c = AppConfig.fromEnv({ ...valid, CORS_ORIGINS: ' https://preview.vercel.app/ , http://localhost:4173' });
    expect(c.corsOrigins).toEqual([
      'https://better-self.app',
      'https://preview.vercel.app',
      'http://localhost:4173',
    ]);
  });

  it('falha no boot listando tudo que falta', () => {
    expect(() => AppConfig.fromEnv({ PORT: 'abc' })).toThrow(
      /APP_URL[\s\S]*SUPABASE_URL[\s\S]*DATABASE_URL/,
    );
    expect(() => AppConfig.fromEnv({ ...valid, PORT: 'abc' })).toThrow(/PORT/);
  });

  it('recusa DATABASE_URL que nao e Postgres', () => {
    expect(() => AppConfig.fromEnv({ ...valid, DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });
});

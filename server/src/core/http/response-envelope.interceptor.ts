import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';
import type { ApiMeta, ApiOk } from '../../contracts.js';

/**
 * Resposta com paginacao. O controller devolve `new WithMeta(itens, { page, total })` e o
 * interceptor monta `{ ok: true, data: itens, meta }`.
 */
export class WithMeta<T> {
  constructor(
    readonly data: T,
    readonly meta: ApiMeta,
  ) {}
}

/**
 * Interceptor global: todo retorno de controller vira `{ ok: true, data }` (SAAS_PLAN §5.4).
 * Controller devolve o dado puro e nunca monta envelope na mao.
 * Retorno vazio (void) vira `data: null`, para o campo existir no JSON.
 */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<ApiOk<unknown>> {
    return next.handle().pipe(
      map((value: unknown) =>
        value instanceof WithMeta
          ? { ok: true as const, data: value.data, meta: value.meta }
          : { ok: true as const, data: value ?? null },
      ),
    );
  }
}

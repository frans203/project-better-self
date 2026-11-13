import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { API_ERROR_HTTP_STATUS, type ApiError, type ApiFail } from '../../contracts.js';
import { ApiException } from './api-exception.js';

/**
 * Filtro global: TODA falha sai no envelope `{ ok: false, error }` do contrato, com o
 * status HTTP do codigo. Tres origens:
 *
 * 1. ApiException — ja vem no formato certo.
 * 2. HttpException do proprio Nest (rota inexistente, body invalido, payload grande) —
 *    traduzida pelo status, com mensagem nossa. A do Nest ("Cannot GET /x") nao sai.
 * 3. Qualquer outra coisa — bug ou fornecedor sem traducao. Vira INTERNAL e o detalhe
 *    fica so no log, nunca na resposta.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

    const error = this.toApiError(exception, req);
    if (res.headersSent) return;

    const body: ApiFail = { ok: false, error };
    res.status(API_ERROR_HTTP_STATUS[error.code]).json(body);
  }

  private toApiError(exception: unknown, req: Request): ApiError {
    if (exception instanceof ApiException) return exception.apiError;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      switch (status) {
        case 400:
        case 413:
        case 415:
        case 422:
          return {
            code: 'VALIDATION',
            message: 'Requisição inválida.',
            details: { fields: {} },
          };
        case 401:
          return { code: 'UNAUTHENTICATED', message: 'Sessão ausente ou expirada.' };
        case 403:
          return { code: 'FORBIDDEN', message: 'Acesso negado.' };
        case 404:
        case 405:
          return { code: 'NOT_FOUND', message: 'Rota não encontrada.' };
        case 409:
          return { code: 'CONFLICT', message: 'Conflito com o estado atual.' };
      }
    }

    this.logger.error(
      `${req.method} ${req.originalUrl} -> erro nao tratado`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    return { code: 'INTERNAL', message: 'Falha interna. Tente novamente.' };
  }
}

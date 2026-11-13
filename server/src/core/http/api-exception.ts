import { HttpException } from '@nestjs/common';
import { API_ERROR_HTTP_STATUS, type ApiError, type ApiErrorCode } from '../../contracts.js';

/** `details` e obrigatorio onde o contrato exige e proibido onde ele nao existe. */
type DetailsArg<C extends ApiErrorCode> =
  ApiError<C> extends { details: infer D } ? [details: D] : [];

/**
 * Unico jeito de um use case ou adapter devolver erro ao cliente. O status HTTP sai do
 * contrato (API_ERROR_HTTP_STATUS), nunca escolhido na mao.
 *
 *   throw new ApiException('NOT_FOUND', 'Checkout não encontrado.')
 *   throw new ApiException('ENTITLEMENT_REQUIRED', 'Relatório completo é do Pro.', {
 *     required: 'feature:reports.full',
 *   })
 *
 * Adapter traduz o erro do fornecedor (Postgres, AbacatePay) para um destes codigos
 * antes de lancar — mensagem crua de fornecedor nunca chega ao front (SAAS_PLAN §5.4).
 */
export class ApiException<C extends ApiErrorCode = ApiErrorCode> extends HttpException {
  readonly apiError: ApiError<C>;

  constructor(code: C, message: string, ...[details]: DetailsArg<C>) {
    const apiError = (details === undefined ? { code, message } : { code, message, details }) as ApiError<C>;
    super(apiError, API_ERROR_HTTP_STATUS[code]);
    this.apiError = apiError;
  }
}

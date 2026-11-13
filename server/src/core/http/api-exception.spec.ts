import { ApiException } from './api-exception.js';

describe('ApiException', () => {
  it('status vem do contrato', () => {
    expect(new ApiException('CONFLICT', 'x').getStatus()).toBe(409);
    expect(new ApiException('ENTITLEMENT_REQUIRED', 'x', { required: 'archetype:espartano' }).getStatus()).toBe(402);
  });

  it('formato errado nao compila', () => {
    // Conferido pelo `npm run typecheck`: cada linha abaixo TEM que dar erro de tipo.
    const casos = () => [
      // @ts-expect-error VALIDATION exige details.fields
      new ApiException('VALIDATION', 'x'),
      // @ts-expect-error NOT_FOUND nao aceita details
      new ApiException('NOT_FOUND', 'x', { fields: {} }),
      // @ts-expect-error codigo fora do contrato
      new ApiException('TEAPOT', 'x'),
      // PENDENTE (proximo PR do contrato): ApiErrorDetails.ENTITLEMENT_REQUIRED.required e
      // EntitlementKey e aceita curinga ('feature:*'). Deveria ser RequirableEntitlement:
      // nenhuma tela exige curinga. Quando o contrato mudar, volta aqui um @ts-expect-error.
    ];
    expect(typeof casos).toBe('function');
  });
});

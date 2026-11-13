/**
 * Porta de entrada do contrato na API. Todo arquivo do server/ importa daqui, nunca do
 * caminho relativo direto: se o contrato mudar de lugar (ex.: packages/contracts no
 * monorepo com workspaces, SAAS_PLAN §5.2), muda so esta linha.
 */
export * from '../../contracts/api.js';

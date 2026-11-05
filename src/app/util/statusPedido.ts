// Situações do pedido. Ajuste os códigos conforme o valor gravado em status_atendimento.
export type StatusPedido = 'Aberto' | 'Em processamento' | 'Concluído' | 'Cancelado';

export const TODOS_STATUS: StatusPedido[] = ['Aberto', 'Em processamento', 'Concluído', 'Cancelado'];

export function statusTexto(s: string): string {
  switch ((s ?? '').toUpperCase()) {
    case 'A': case 'ABERTO': return 'Aberto';
    case 'P': case 'EM PROCESSAMENTO': return 'Em processamento';
    case 'C': case 'CONCLUÍDO': case 'CONCLUIDO': return 'Concluído';
    case 'X': case 'N': case 'CANCELADO': return 'Cancelado';
    default: return s;
  }
}

export function statusClasse(s: string): string {
  switch (statusTexto(s)) {
    case 'Aberto': return 'aberto';
    case 'Em processamento': return 'proc';
    case 'Concluído': return 'ok';
    case 'Cancelado': return 'off';
    default: return '';
  }
}

/** Transições que o formulário oferece. A validação definitiva é do backend. */
export function proximosStatus(atual: string): StatusPedido[] {
  switch (statusTexto(atual)) {
    case 'Aberto': return ['Em processamento', 'Cancelado'];
    case 'Em processamento': return ['Concluído', 'Cancelado'];
    default: return [];   // Concluído e Cancelado são finais
  }
}

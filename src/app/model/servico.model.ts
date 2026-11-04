// Ajuste ao DTO da sua API (Swagger de /api/itens). Serviço usa só a tabela item.
export interface Servico {
  idItem: number;
  idCategoria: number;
  item: string;
  descricaoItem: string;
  preco: number;
  tipoItem: string;              // 'S' = serviço
  ativoProdutoServico: string;   // 'S' = ativo, 'N' = inativo
}

export type ServicoDto = Omit<Servico, 'idItem'>;
// Ajuste aos nomes devolvidos por GET /api/estoque (veja no Swagger).
export interface EstoqueItem {
  idItem: number;
  item: string;
  descricaoItem: string;
  preco: number;
  precoVenda: number;
  unidade: string;
  categoria: string;
  quantidadeEstoque: number;
  ativoProdutoServico: string;   // 'S' = ativo, 'N' = inativo
}
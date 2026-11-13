// Ajuste ao DTO da sua API (Swagger de /api/itens). Combina as tabelas item + produto.
export interface Produto {
  idItem: number;
  idcategoria: number;
  item: string;
  descricaoItem: string;
  preco: number;
  tipoItem: string;              // 'P' = produto
  ativoProdutoServico: string;   // 'S' = ativo, 'N' = inativo
  codigoPreco: number | null;
  precoVenda: number | null;     // calculado por função no banco: somente leitura
  unidade: string;
}

/** O que o formulário envia: sem idItem e sem precoVenda (o banco calcula). */
export type ProdutoDto = Omit<Produto, 'idItem' | 'precoVenda'>;
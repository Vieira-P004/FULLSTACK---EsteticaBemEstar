// Ajuste os nomes dos campos conforme o JSON que a sua API devolve (veja no Swagger).
export interface Item {
  idItem: number;
  idCategoria: number;
  item: string;
  descricaoItem: string;
  preco: number;
  tipoItem: string;              // 'P' = produto, 'S' = serviço
  ativoProdutoServico: string;   // 'S' = ativo, 'N' = inativo
}

export interface Categoria {
  idCategoria: number;
  categoria: string;
}

export interface Estoque {
  idItem: number;
  quantidadeEstoque: number;
}

// Item já preparado para exibição no catálogo
export interface ItemCatalogo extends Item {
  nomeCategoria: string;
  quantidadeEstoque: number | null; // null para serviços
}
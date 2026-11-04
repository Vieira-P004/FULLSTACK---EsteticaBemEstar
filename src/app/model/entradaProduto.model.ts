// Ajuste ao DTO da sua API (Swagger do POST /api/entradaprodutos).
export interface EntradaProdutoDto {
  idItem: number;
  dataEntrada: string;            // 'yyyy-MM-dd'
  quantidadeEntrada: number;
  unidade: string;
  valorUnitarioEntrada: number;
}

export interface EntradaProduto extends EntradaProdutoDto {
  idEntradaProduto: number;
}
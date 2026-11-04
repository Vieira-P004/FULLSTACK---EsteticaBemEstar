// Ajuste ao DTO da sua API (Swagger do POST /api/pedidos).
export interface PedidoItemDto {
  idItem: number;
  quantidade: number;
}

export interface PedidoDto {
  idPessoa: number;
  itens: PedidoItemDto[];
}

export interface PedidoCriado {
  idAtendimento: number;   // número do pedido devolvido pela API
}

export interface PessoaResumo {
  idPessoa: number;
  nome: string;
  cpf: number;
}

export interface PedidoResumo {
  idAtendimento: number;
  dataAtendimento: string;      // 'yyyy-MM-dd'
  valorTotal: number;
  statusAtendimento: string;    // letra (A, P, C, X) ou texto, conforme a sua API
}
 
export interface PedidoItemDetalhe {
  item: string;                 // nome do produto ou serviço
  quantidade: number;
  valorUnitario: number;        // preço registrado no momento da compra
}
 
export interface PedidoDetalhe extends PedidoResumo {
  idPessoa?: number;            // se a API devolver, o frontend confere o dono do pedido
  itens: PedidoItemDetalhe[];
}

export interface PedidoAdminItem {
  item: string;
  nomeFuncionario: string | null;   // pedido online pode não ter funcionário
  cargoFuncionario: string | null;
  quantidade: number;
  valorUnitario: number;
}
 
export interface PedidoAdmin {
  idAtendimento: number;
  idPessoa: number;
  nomeCliente: string;
  dataAtendimento: string;          // 'yyyy-MM-dd'
  valorTotal: number;
  statusAtendimento: string;        // letra (A, P, C, X) ou texto, conforme a sua API
  itens: PedidoAdminItem[];
}
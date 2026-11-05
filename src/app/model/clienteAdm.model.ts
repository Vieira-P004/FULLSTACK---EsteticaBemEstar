// Ajuste os nomes ao DTO da sua API (veja no Swagger do POST /api/pessoas).
export interface EnderecoDto {
  cep: string;
  numero: string;
  complemento: string | null;
}

export interface ClienteDto {
  nome: string;
  cpf: number;              // coluna BIGINT no banco
  dataNascimento: string;   // 'yyyy-MM-dd'
  sexo: string;             // 'F' ou 'M'
  email: string;
  telefone: number;         // coluna BIGINT no banco
  endereco: EnderecoDto;
}

export interface ViaCepResposta {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

// ---- Painel administrativo: listagem de clientes ----
export interface ClienteLista {
  idPessoa: number;
  nome: string;
  cpf: number;
  dataNascimento?: string;
  sexo?: string;
  email: string;
  telefone: number;
  ativoPessoa: string;   // 'S' = ativo, 'N' = inativo
}
export interface EnderecoDto {
  cep: string;
  numero: string;
  complemento: string | null;
}

export interface ClienteDto {
  nome: string;
  cpf: number;              
  dataNascimento: string;   
  sexo: string;            
  email: string;
  telefone: number;  
  ativoPessoa: string;       
  enderecos: EnderecoDto[];
}

export interface ViaCepResposta {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}
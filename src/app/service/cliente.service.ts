import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteDto, ViaCepResposta } from '../model/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private api = 'https://localhost:7077/api'; // ajuste para a porta da sua API

  cadastrar(cliente: ClienteDto): Observable<unknown> {
    return this.http.post(`${this.api}/PessoaEndereco`, cliente);
  }

  // Só para preencher a tela: a API não guarda logradouro, bairro, cidade e UF.
  buscarCep(cep: string): Observable<ViaCepResposta> {
    return this.http.get<ViaCepResposta>(`https://viacep.com.br/ws/${cep}/json/`);
  }
}
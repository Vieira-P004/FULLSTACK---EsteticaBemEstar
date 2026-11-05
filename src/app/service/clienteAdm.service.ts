import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteDto, ClienteLista, ViaCepResposta } from '../model/clienteAdm.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private api = 'http://localhost:4200'; // ajuste para a porta da sua API

  cadastrar(cliente: ClienteDto): Observable<unknown> {
    return this.http.post(`${this.api}/pessoas`, cliente);
  }

  /** GET /api/pessoas — painel administrativo. */
  listar(): Observable<ClienteLista[]> {
    return this.http.get<ClienteLista[]>(`${this.api}/pessoas`);
  }

  /** GET /api/pessoas/{id} — 404 se não existir. */
  buscarPorId(id: number): Observable<ClienteLista> {
    return this.http.get<ClienteLista>(`${this.api}/pessoas/${id}`);
  }

  // Só para preencher a tela: a API não guarda logradouro, bairro, cidade e UF.
  buscarCep(cep: string): Observable<ViaCepResposta> {
    return this.http.get<ViaCepResposta>(`https://viacep.com.br/ws/${cep}/json/`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servico, ServicoDto } from '../model/servico.model';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private http = inject(HttpClient);
  // O roteiro usa /api/itens para produtos e serviços.
  private url = 'http://localhost:5000/api/itens'; // ajuste para a porta da sua API

  listar(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.url);
  }

  buscarPorId(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.url}/${id}`);
  }

  cadastrar(servico: ServicoDto): Observable<unknown> {
    return this.http.post(this.url, servico);
  }

  atualizar(id: number, servico: ServicoDto): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, { idItem: id, ...servico });
  }
}
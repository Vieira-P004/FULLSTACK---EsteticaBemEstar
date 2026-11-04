import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntradaProduto, EntradaProdutoDto } from '../model/entradaProduto.model';

@Injectable({ providedIn: 'root' })
export class EntradaProdutoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:5000/api/entradaprodutos'; // ajuste para a porta da sua API

  listar(): Observable<EntradaProduto[]> {
    return this.http.get<EntradaProduto[]>(this.url);
  }

  buscarPorId(id: number): Observable<EntradaProduto> {
    return this.http.get<EntradaProduto>(`${this.url}/${id}`);
  }

  /** O backend grava a entrada e o trigger do MySQL atualiza estoque e preço. */
  registrar(entrada: EntradaProdutoDto): Observable<unknown> {
    return this.http.post(this.url, entrada);
  }
}
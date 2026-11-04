import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto, ProdutoDto } from '../model/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);
  // O roteiro usa /api/itens para produtos e serviços. Se o seu backend tiver
  // um controller próprio, troque por 'http://localhost:5000/api/produtos'.
  private url = 'http://localhost:5000/api/itens';

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.url);
  }

  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.url}/${id}`);
  }

  cadastrar(produto: ProdutoDto): Observable<unknown> {
    return this.http.post(this.url, produto);
  }

  atualizar(id: number, produto: ProdutoDto): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, { idItem: id, ...produto });
  }
}
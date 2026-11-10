import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../model/item.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private url = 'https://localhost:7077/api/Categorium'; // ajuste para a porta da sua API

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  buscarPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }

  cadastrar(categoria: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, { categoria });
  }

  atualizar(id: number, categoria: string): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, { idCategoria: id, categoria });
  }

  excluir(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
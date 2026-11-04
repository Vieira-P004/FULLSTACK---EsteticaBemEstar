import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, Estoque, Item } from '../model/item.model';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);
  private api = 'http://localhost:5000/api'; // ajuste para a porta da sua API

  listarItens(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.api}/itens`);
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.api}/categorias`);
  }

  listarEstoque(): Observable<Estoque[]> {
    return this.http.get<Estoque[]>(`${this.api}/estoque`);
  }
}
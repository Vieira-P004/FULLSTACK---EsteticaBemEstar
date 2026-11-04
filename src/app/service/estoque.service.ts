import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstoqueItem } from '../model/estoque.model';

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private http = inject(HttpClient);
  private url = 'http://localhost:5000/api/estoque'; // ajuste para a porta da sua API

  /** GET /api/estoque — registros de estoque com as informações dos produtos. */
  listar(): Observable<EstoqueItem[]> {
    return this.http.get<EstoqueItem[]>(this.url);
  }

  /** GET /api/estoque/{idItem} — situação de um item específico (404 se não existir). */
  buscarPorId(idItem: number): Observable<EstoqueItem> {
    return this.http.get<EstoqueItem>(`${this.url}/${idItem}`);
  }
}
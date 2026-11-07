import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoAdmin } from '../model/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoAdminService {
  private http = inject(HttpClient);
  private url = 'https://localhost:7248/api'; // ajuste para a porta da sua API

  /** GET /api/pedidos?status=Aberto — sem status, lista todos. */
  listar(status?: string): Observable<PedidoAdmin[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<PedidoAdmin[]>(this.url, { params });
  }

  buscarPorId(id: number): Observable<PedidoAdmin> {
    return this.http.get<PedidoAdmin>(`${this.url}/${id}`);
  }

  /** PUT /api/pedidos/{id}/status — o backend valida a transição e o estoque. */
  atualizarStatus(id: number, status: string): Observable<unknown> {
    return this.http.put(`${this.url}/${id}/status`, { status });
  }
}
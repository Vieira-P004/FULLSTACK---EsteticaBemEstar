import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PedidoCriado, PedidoDto, PessoaResumo, PedidoResumo, PedidoDetalhe } from '../model/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private api = 'https://localhost:7248/api'; // ajuste para a porta da sua API

  /** Identifica o cliente pelo CPF usando GET /api/pessoas (sem login, como pede o roteiro). */
  buscarClientePorCpf(cpf: string): Observable<PessoaResumo | undefined> {
    return this.http.get<PessoaResumo[]>(`${this.api}/pessoas`)
      .pipe(map(lista => lista.find(p => String(p.cpf).padStart(11, '0') === cpf)));
  }

  registrar(pedido: PedidoDto): Observable<PedidoCriado> {
    return this.http.post<PedidoCriado>(`${this.api}/pedidos`, pedido);
  }

  listarDoCliente(idPessoa: number): Observable<PedidoResumo[]> {
    return this.http.get<PedidoResumo[]>(`${this.api}/pessoas/${idPessoa}/pedidos`);
  }
 
  /** GET /api/pedidos/{id} — itens, quantidades e preços do pedido. */
  buscarPorId(idPedido: number): Observable<PedidoDetalhe> {
    return this.http.get<PedidoDetalhe>(`${this.api}/pedidos/${idPedido}`);
  }
}
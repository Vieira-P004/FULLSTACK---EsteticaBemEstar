import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PedidoCriado, PedidoDto, PessoaResumo, PedidoResumo, PedidoDetalhe } from '../model/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private api = 'https://localhost:7077/api'; // ajuste para a porta da sua API

  /** Identifica o cliente pelo CPF usando GET /api/PessoaEndereco (sem login, como pede o roteiro). */
  buscarClientePorCpf(cpf: string): Observable<PessoaResumo | undefined> {
    return this.http.get<PessoaResumo[]>(`${this.api}/PessoaEndereco`)
      .pipe(map(lista => lista.find(p => String(p.cpf).padStart(11, '0') === cpf)));
  }

  /** Atenção: /api/pedidos não existe. Usando /api/Atendimento como substituto (confira o schema). */
  registrar(pedido: PedidoDto): Observable<PedidoCriado> {
    return this.http.post<PedidoCriado>(`${this.api}/Atendimento`, pedido);
  }

  /** Busca todos os ProdutoItem e filtra no front pelo id da pessoa. */
  listarDoCliente(idPessoa: number): Observable<PedidoResumo[]> {
    return this.http.get<any[]>(`${this.api}/ProdutoItem`)
      .pipe(map(lista => lista.filter(i => i.idPessoa === idPessoa) as PedidoResumo[]));
  }

  /** Atenção: /api/pedidos/{id} não existe. Usando /api/Atendimento/{id} como substituto. */
  buscarPorId(idPedido: number): Observable<PedidoDetalhe> {
    return this.http.get<PedidoDetalhe>(`${this.api}/Atendimento/${idPedido}`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, of } from 'rxjs';

// Só os campos que o resumo usa (ajuste aos nomes devolvidos pela sua API).
export interface ItemResumo { tipoItem: string; ativoProdutoServico: string; }
export interface PedidoResumoDash { statusAtendimento: string; }
export interface EstoqueResumo { quantidadeEstoque: number; }

export interface DadosResumo {
  pessoas: unknown[] | null;
  itens: ItemResumo[] | null;
  pedidos: PedidoResumoDash[] | null;
  estoque: EstoqueResumo[] | null;
}

@Injectable({ providedIn: 'root' })
export class ResumoService {
  private http = inject(HttpClient);
  private api = 'https://localhost:7077/api'; // ajuste para a porta da sua API

  /** Se uma consulta falhar, ela vira null e as outras continuam funcionando. */
  carregar(): Observable<DadosResumo> {
    const buscar = <T>(rota: string) =>
      this.http.get<T[]>(`${this.api}/${rota}`).pipe(catchError(() => of(null)));

    return forkJoin({
      pessoas: buscar<unknown>('Pessoa'),
      itens: buscar<ItemResumo>('Item'),
      pedidos: buscar<PedidoResumoDash>('Atendimento'),
      estoque: buscar<EstoqueResumo>('Estoque'),
    });
  }
}
import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { PedidoAdmin } from '../../../model/pedido.model';
import { PedidoAdminService } from '../../../service/pedidoAdmin.service';
import { TODOS_STATUS, proximosStatus, statusClasse, statusTexto } from '../../../util/statusPedido';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-pedidos-em-aberto',
  styleUrl: './pedidos-em-aberto.css',
  templateUrl: './pedidos-em-aberto.html',
})
export class PedidosEmAberto implements OnInit {
  private service = inject(PedidoAdminService);
 
  readonly opcoesStatus = TODOS_STATUS;
  readonly statusTexto = statusTexto;
  readonly statusClasse = statusClasse;
  readonly proximosStatus = proximosStatus;
 
  pedidos = signal<PedidoAdmin[]>([]);
  carregando = signal(true);
  atualizandoId = signal<number | null>(null);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  filtroStatus = new FormControl('Aberto', { nonNullable: true });   // '' = todos
  buscaId = new FormControl<number | null>(null);
 
  ngOnInit(): void {
    this.carregar();
  }
 
  /** Lista pedidos filtrando pela situação escolhida (padrão: em aberto). */
  carregar(): void {
    this.carregando.set(true);
    this.buscaId.reset();
    this.service.listar(this.filtroStatus.value || undefined).subscribe({
      next: lista => {
        this.pedidos.set([...lista].sort((a, b) => b.idAtendimento - a.idAtendimento));
        this.carregando.set(false);
      },
      error: e => this.falha(e),
    });
  }
 
  filtrar(): void {
    this.mensagem.set(null);
    const id = this.buscaId.value;
    if (id && id > 0) this.abrirPorId(id);
    else this.carregar();
  }
 
  /** Abre um pedido específico pelo ID. */
  private abrirPorId(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: p => { this.pedidos.set([p]); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => {
        this.pedidos.set([]);
        if (e.status === 404) { this.carregando.set(false); this.mostrar('err', `Pedido ${id} não localizado.`); }
        else this.falha(e);
      },
    });
  }
 
  atualizarStatus(p: PedidoAdmin, novoStatus: string): void {
    if (!novoStatus) { this.mostrar('err', 'Selecione a nova situação do pedido.'); return; }
    if (novoStatus === 'Cancelado' && !confirm(`Cancelar o pedido ${p.idAtendimento}?`)) return;
 
    this.atualizandoId.set(p.idAtendimento);
    this.service.atualizarStatus(p.idAtendimento, novoStatus).subscribe({
      next: () => {
        this.atualizandoId.set(null);
        this.mostrar('ok', `Pedido ${p.idAtendimento} atualizado para "${novoStatus}".`);
        this.recarregarMantendoMensagem();
      },
      error: (e: HttpErrorResponse) => {
        this.atualizandoId.set(null);
        // transição inválida ou estoque insuficiente: o backend explica o motivo
        if (e.status === 400 || e.status === 409 || e.status === 422)
          this.mostrar('err', typeof e.error === 'string' ? e.error : e.error?.message ?? 'Transição de situação não permitida.');
        else if (e.status === 404) this.mostrar('err', `Pedido ${p.idAtendimento} não localizado.`);
        else this.falha(e);
      },
    });
  }
 
  private recarregarMantendoMensagem(): void {
    const msg = this.mensagem();
    this.service.listar(this.filtroStatus.value || undefined).subscribe({
      next: lista => {
        this.pedidos.set([...lista].sort((a, b) => b.idAtendimento - a.idAtendimento));
        this.mensagem.set(msg);
      },
      error: e => this.falha(e),
    });
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else this.mostrar('err', 'Não foi possível processar a solicitação. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}

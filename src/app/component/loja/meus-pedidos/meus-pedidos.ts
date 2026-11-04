import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { CarrinhoService } from '../../../service/carrinho.service';
import { PedidoService } from '../../../service/pedido.service';
import { PedidoDetalhe, PedidoResumo } from '../../../model/pedido.model';

@Component({
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-meus-pedidos',
  styleUrl: './meus-pedidos.css',
  templateUrl: './meus-pedidos.html',
})
export class MeusPedidos {
   private pedidoService = inject(PedidoService);
  readonly carrinho = inject(CarrinhoService);
 
  cpf = signal('');
  carregando = signal(false);
  consultou = signal(false);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  private idCliente: number | null = null;   // cliente identificado pelo CPF
  nomeCliente = signal('');
  pedidos = signal<PedidoResumo[]>([]);
  detalhe = signal<PedidoDetalhe | null>(null);
 
  consultar(): void {
    const cpf = this.cpf().replace(/\D/g, '');
    this.mensagem.set(null);
    this.detalhe.set(null);
    this.pedidos.set([]);
    this.consultou.set(false);
 
    if (cpf.length !== 11) { this.mostrar('err', 'Informe o CPF com 11 números.'); return; }
 
    this.carregando.set(true);
    this.pedidoService.buscarClientePorCpf(cpf).subscribe({
      next: cliente => {
        if (!cliente) {
          this.carregando.set(false);
          this.mostrar('err', 'Cliente não encontrado. Confira o CPF ou faça o cadastro.');
          return;
        }
        this.idCliente = cliente.idPessoa;
        this.nomeCliente.set(cliente.nome);
        this.carregarPedidos(cliente.idPessoa);
      },
      error: e => this.falha(e),
    });
  }
 
  private carregarPedidos(idPessoa: number): void {
    this.pedidoService.listarDoCliente(idPessoa).subscribe({
      next: lista => {
        // mais recentes primeiro
        this.pedidos.set([...lista].sort((a, b) => b.idAtendimento - a.idAtendimento));
        this.consultou.set(true);
        this.carregando.set(false);
      },
      error: e => this.falha(e),
    });
  }
 
  verItens(p: PedidoResumo): void {
    this.mensagem.set(null);
    this.pedidoService.buscarPorId(p.idAtendimento).subscribe({
      next: d => {
        // nunca exibir pedido de outro cliente
        if (d.idPessoa !== undefined && d.idPessoa !== this.idCliente) {
          this.mostrar('err', 'Este pedido não pertence ao cliente identificado.');
          return;
        }
        this.detalhe.set(d);
      },
      error: e => this.falha(e),
    });
  }
 
  fecharDetalhe(): void {
    this.detalhe.set(null);
  }
 
  // Ajuste os códigos conforme os valores gravados em status_atendimento
  statusTexto(s: string): string {
    switch ((s ?? '').toUpperCase()) {
      case 'A': case 'ABERTO': return 'Aberto';
      case 'P': case 'EM PROCESSAMENTO': return 'Em processamento';
      case 'C': case 'CONCLUÍDO': case 'CONCLUIDO': return 'Concluído';
      case 'X': case 'N': case 'CANCELADO': return 'Cancelado';
      default: return s;
    }
  }
 
  statusClasse(s: string): string {
    switch (this.statusTexto(s)) {
      case 'Aberto': return 'aberto';
      case 'Em processamento': return 'proc';
      case 'Concluído': return 'ok';
      case 'Cancelado': return 'off';
      default: return '';
    }
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) { this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.'); return; }
    if (e.status === 404) { this.mostrar('err', 'Nenhum registro encontrado.'); return; }
    this.mostrar('err', 'Não foi possível consultar os pedidos. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}

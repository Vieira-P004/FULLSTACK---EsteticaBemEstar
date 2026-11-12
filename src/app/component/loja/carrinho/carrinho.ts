import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { CarrinhoService, ItemCarrinho } from '../../../service/carrinho.service';
import { PedidoService } from '../../../service/pedido.service';

@Component({
  imports: [FormsModule, RouterLink, CurrencyPipe],
  selector: 'app-carrinho',
  styleUrl: './carrinho.css',
  templateUrl: './carrinho.html',
})
export class Carrinho {readonly carrinho = inject(CarrinhoService);
  private pedidoService = inject(PedidoService);
 
  cpf = signal('');
  enviando = signal(false);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  ehProduto(i: ItemCarrinho): boolean {
    return i.item.tipoItem === 'P';
  }
 
  alterarQuantidade(i: ItemCarrinho, valor: string): void {
    const n = Math.floor(Number(valor));
    if (!n || n < 1) { this.carrinho.alterarQuantidade(i.item.idItem, 1); return; }
    this.carrinho.alterarQuantidade(i.item.idItem, n);
  }
 
  remover(i: ItemCarrinho): void {
    this.carrinho.remover(i.item.idItem);
  }
 
  confirmar(): void {
    const itens = this.carrinho.itens();
    const cpf = this.cpf().replace(/\D/g, '');
 
    if (itens.length === 0) { this.mostrar('err', 'O carrinho está vazio.'); return; }
    if (cpf.length !== 11) { this.mostrar('err', 'Informe o CPF (11 números) para identificar o cliente.'); return; }
 
    this.enviando.set(true);
    this.pedidoService.buscarClientePorCpf(cpf).subscribe({
      next: cliente => {
        if (!cliente) {
          this.enviando.set(false);
          this.mostrar('err', 'Cliente não encontrado. Faça o cadastro antes de finalizar a compra.');
          return;
        }
        this.enviarPedido(cliente.idPessoa);
      },
      error: e => this.falha(e),
    });
  }
 
  private enviarPedido(idPessoa: number): void {
  // preço e estoque são validados pelo backend; aqui vão só ids e quantidades
  const pedido = {
    idPessoa,
    statusAtendimento: 'A',   // char(1): confirme o valor usado no seu banco
    itens: this.carrinho.itens().map(i => ({
      idItem: i.item.idItem,
      quantidade: i.quantidade,
    })),
  };

  this.pedidoService.registrar(pedido).subscribe({
    next: r => {
      this.enviando.set(false);
      this.carrinho.limpar();
      this.cpf.set('');
      this.mostrar('ok', `Pedido nº ${r.idAtendimento} registrado! Ele está aberto, aguardando tratamento.`);
    },
    error: e => this.falha(e),
  });
}
  private falha(e: HttpErrorResponse): void {
    this.enviando.set(false);
    if (e.status === 0) { this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.'); return; }
    if (e.status === 400 || e.status === 409) {
      const msg = typeof e.error === 'string' ? e.error : e.error?.message ?? e.error?.title;
      this.mostrar('err', msg ?? 'Não foi possível registrar o pedido (estoque insuficiente ou dados inválidos).');
      return;
    }
    if (e.status === 404) { this.mostrar('err', 'Recurso não encontrado na API.'); return; }
    this.mostrar('err', 'Erro ao registrar o pedido. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }

}

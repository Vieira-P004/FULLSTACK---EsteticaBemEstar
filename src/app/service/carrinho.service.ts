import { Injectable, computed, signal } from '@angular/core';
import { ItemCatalogo } from '../model/item.model';

export interface ItemCarrinho {
  item: ItemCatalogo;
  quantidade: number;
}

// O carrinho fica só no frontend; o pedido é gravado no MySQL ao confirmar a compra.
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  readonly itens = signal<ItemCarrinho[]>([]);
  readonly totalItens = computed(() => this.itens().reduce((s, i) => s + i.quantidade, 0));
  readonly valorTotal = computed(() => this.itens().reduce((s, i) => s + i.item.preco * i.quantidade, 0));

  /** Retorna uma mensagem de erro, ou null se adicionou. */
  adicionar(item: ItemCatalogo): string | null {
    const lista = this.itens();
    const existente = lista.find(i => i.item.idItem === item.idItem);
    const eProduto = item.tipoItem === 'P';

    if (existente) {
      // serviço não é mercadoria: não acumula quantidade
      if (!eProduto) return 'Este serviço já está no carrinho.';
      if (existente.quantidade + 1 > (item.quantidadeEstoque ?? 0))
        return `Estoque insuficiente: só há ${item.quantidadeEstoque} unidade(s).`;
      this.itens.set(lista.map(i => i.item.idItem === item.idItem ? { ...i, quantidade: i.quantidade + 1 } : i));
      return null;
    }

    if (eProduto && (item.quantidadeEstoque ?? 0) < 1) return 'Produto sem estoque.';
    this.itens.set([...lista, { item, quantidade: 1 }]);
    return null;
  }

  alterarQuantidade(idItem: number, quantidade: number): void {
    this.itens.set(this.itens().map(i => {
      if (i.item.idItem !== idItem) return i;
      const max = i.item.tipoItem === 'P' ? (i.item.quantidadeEstoque ?? 1) : 1;
      return { ...i, quantidade: Math.max(1, Math.min(quantidade, max)) };
    }));
  }

  remover(idItem: number): void {
    this.itens.set(this.itens().filter(i => i.item.idItem !== idItem));
  }

  limpar(): void {
    this.itens.set([]);
  }
}
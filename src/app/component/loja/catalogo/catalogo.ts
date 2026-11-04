import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
 
import { Categoria, ItemCatalogo } from '../../../model/item.model';
import { CatalogoService } from '../../../service/catalogo.service';
import { CarrinhoService } from '../../../service/carrinho.service';

@Component({
  imports: [FormsModule, RouterLink, CurrencyPipe],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})

export class Catalogo {

   private catalogoService = inject(CatalogoService);
  readonly carrinho = inject(CarrinhoService);
 
  // estado da tela
  itens = signal<ItemCatalogo[]>([]);
  categorias = signal<Categoria[]>([]);
  carregando = signal(true);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  // filtros
  termo = signal('');
  tipo = signal('');                       // '' = todos, 'P' = produtos, 'S' = serviços
  categoriaSelecionada = signal<number | null>(null);
 
  // lista exibida: só itens ativos, aplicando busca por nome, categoria e tipo
  itensFiltrados = computed(() => {
    const termo = this.termo().trim().toLowerCase();
    const tipo = this.tipo();
    const cat = this.categoriaSelecionada();
 
    return this.itens().filter(i =>
      i.ativoProdutoServico === 'S' &&
      (!termo || i.item.toLowerCase().includes(termo)) &&
      (!tipo || i.tipoItem === tipo) &&
      (cat === null || i.idCategoria === cat)
    );
  });
 
  ngOnInit(): void {
    this.carregar();
  }
 
  carregar(): void {
    this.carregando.set(true);
 
    forkJoin({
      itens: this.catalogoService.listarItens(),
      categorias: this.catalogoService.listarCategorias(),
      estoque: this.catalogoService.listarEstoque(),
    }).subscribe({
      next: ({ itens, categorias, estoque }) => {
        const nomes = new Map(categorias.map(c => [c.idCategoria, c.categoria]));
        const saldos = new Map(estoque.map(e => [e.idItem, e.quantidadeEstoque]));
 
        this.categorias.set(categorias);
        this.itens.set(itens.map(i => ({
          ...i,
          nomeCategoria: nomes.get(i.idCategoria) ?? 'Sem categoria',
          // serviço não tem estoque
          quantidadeEstoque: i.tipoItem === 'P' ? (saldos.get(i.idItem) ?? 0) : null,
        })));
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.mostrar('err', 'Não foi possível carregar o catálogo. Verifique se a API está em execução.');
      },
    });
  }
 
  filtrarPorCategoria(id: number | null): void {
    this.categoriaSelecionada.set(id);
  }
 
  semEstoque(item: ItemCatalogo): boolean {
    return item.tipoItem === 'P' && (item.quantidadeEstoque ?? 0) < 1;
  }
 
  adicionar(item: ItemCatalogo): void {
    const erro = this.carrinho.adicionar(item);
    erro ? this.mostrar('err', erro) : this.mostrar('ok', `"${item.item}" adicionado ao carrinho.`);
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
    setTimeout(() => this.mensagem.set(null), 4000);
  }

}

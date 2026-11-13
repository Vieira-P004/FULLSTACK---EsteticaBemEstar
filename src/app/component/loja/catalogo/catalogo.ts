import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../../../service/catalogo.service';
import { CarrinhoService } from '../../../service/carrinho.service';
import { Categoria, ItemCatalogo } from '../../../model/item.model';


interface Mensagem {
  tipo: 'ok' | 'err';
  texto: string;
}

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private service = inject(CatalogoService);
  carrinho = inject(CarrinhoService); // público: o template usa carrinho.totalItens()

  itens = signal<ItemCatalogo[]>([]);
  categorias = signal<Categoria[]>([]);
  carregando = signal(true);
  mensagem = signal<Mensagem | null>(null);

  termo = signal('');
  tipo = signal('');
  categoriaSelecionada = signal<number | null>(null);

  itensFiltrados = computed(() => {
    const termo = this.termo().trim().toLowerCase();
    const tipo = this.tipo();
    const cat = this.categoriaSelecionada();
    return this.itens().filter(i =>
      (cat === null || i.idcategoria === cat) &&
      (!tipo || i.tipoItem === tipo) &&
      (!termo || i.item.toLowerCase().includes(termo) || (i.descricaoItem ?? '').toLowerCase().includes(termo))
    );
  });

  constructor() {
    this.service.carregar().subscribe({
      next: ({ itens, categorias }) => {
        this.itens.set(itens);
        this.categorias.set(categorias);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.avisar('err', 'Não foi possível carregar o catálogo. Verifique se a API está rodando.');
      },
    });
  }

  filtrarPorCategoria(id: number | null) {
    this.categoriaSelecionada.set(id);
  }

  semEstoque(i: ItemCatalogo): boolean {
    return i.tipoItem === 'P' && (i.quantidadeEstoque ?? 0) <= 0;
  }

  adicionar(i: ItemCatalogo) {
    if (this.semEstoque(i)) return;
    this.carrinho.adicionar(i); // ajuste o nome do método conforme o seu CarrinhoService
    this.avisar('ok', `"${i.item}" foi adicionado ao carrinho.`);
  }

  private avisar(tipo: Mensagem['tipo'], texto: string) {
    this.mensagem.set({ tipo, texto });
    setTimeout(() => this.mensagem.set(null), 3500);
  }
}
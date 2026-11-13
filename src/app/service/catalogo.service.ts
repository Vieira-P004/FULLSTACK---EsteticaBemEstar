import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { Categoria, Estoque, Item, ItemCatalogo } from '../model/item.model';

export interface Catalogo {
  itens: ItemCatalogo[];
  categorias: Categoria[];
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);
  private api = 'https://localhost:7077/api'; // ajuste para a porta da sua API

  private urlItens = `${this.api}/Item`;
  private urlCategorias = `${this.api}/Categorium`;
  private urlEstoque = `${this.api}/Estoque`;

  /** Lista crua de itens (usada também na tela de entrada de produtos). */
  listarItens(): Observable<Item[]> {
    return this.http.get<any[]>(this.urlItens).pipe(map(lista => lista.map(normalizarItem)));
  }

  /** RP02: consulta um produto ou serviço pelo ID. Devolve 404 se não existir (trate no componente). */
  buscarItemPorId(id: number): Observable<Item> {
    return this.http.get<any>(`${this.urlItens}/${id}`).pipe(map(normalizarItem));
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<any[]>(this.urlCategorias).pipe(map(lista => lista.map(normalizarCategoria)));
  }

  /** Se /api/Estoque ainda não existir (404), devolve lista vazia em vez de quebrar a tela. */
  listarEstoque(): Observable<Estoque[]> {
    return this.http.get<any[]>(this.urlEstoque).pipe(
      map(lista => lista.map(normalizarEstoque)),
      catchError(() => of([] as Estoque[]))
    );
  }

  /** Itens ativos já prontos para exibição na loja (categoria + estoque). */
  carregar(): Observable<Catalogo> {
    return forkJoin({
      itens: this.listarItens(),
      categorias: this.listarCategorias(),
      estoque: this.listarEstoque(),
    }).pipe(
      map(({ itens, categorias, estoque }) => {
        const nomePorCategoria = new Map(categorias.map(c => [c.idcategoria, c.categoria]));
        const qtdPorItem = new Map(estoque.map(e => [e.idItem, e.quantidadeEstoque]));

        const lista: ItemCatalogo[] = itens
          .filter(i => i.ativoProdutoServico === 'S')
          .map(i => ({
            ...i,
            nomeCategoria: nomePorCategoria.get(i.idcategoria) ?? '',
            quantidadeEstoque: i.tipoItem === 'S' ? null : (qtdPorItem.get(i.idItem) ?? 0),
          }));

        return { itens: lista, categorias };
      })
    );
  }
}

/*
 * A API (ASP.NET) converte Iditem/Idcategoria/Item1 para iditem/idcategoria/item1.
 * As funções abaixo aceitam os dois formatos, então funcionam antes e depois de você
 * corrigir os nomes no backend com [JsonPropertyName].
 */
function normalizarCategoria(c: any): Categoria {
  return {
    idcategoria: c.idcategoria ?? c.idcategoria ?? c.id,
    categoria: c.categoria ?? c.nome ?? 'Sem nome',
  };
}

function normalizarItem(i: any): Item {
  return {
    idItem: i.idItem ?? i.iditem ?? i.id,
    idcategoria: i.idcategoria ?? i.idCategoria,
    item: i.item ?? i.item1 ?? 'Sem nome',
    descricaoItem: i.descricaoItem ?? i.descricaoitem ?? '',
    preco: Number(i.preco ?? 0),
    tipoItem: i.tipoItem ?? i.tipoitem ?? 'P',
    ativoProdutoServico: i.ativoProdutoServico ?? i.ativoprodutoservico ?? 'S',
  };
}

function normalizarEstoque(e: any): Estoque {
  return {
    idItem: e.idItem ?? e.iditem,
    quantidadeEstoque: Number(e.quantidadeEstoque ?? e.quantidadeestoque ?? e.quantidade ?? 0),
  };
}
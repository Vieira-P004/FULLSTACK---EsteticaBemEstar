import { Component, OnInit, inject, signal } from '@angular/core';

import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { EstoqueItem } from '../../../model/estoque.model';
import { EstoqueService } from '../../../service/estoque.service';
 
const ESTOQUE_BAIXO = 5; // abaixo ou igual a esse valor, o item é destacado

@Component({
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  selector: 'app-estoque',
  styleUrl: './estoque.css',
  templateUrl: './estoque.html',
})
export class Estoque implements OnInit {
  private service = inject(EstoqueService);
 
  itens = signal<EstoqueItem[]>([]);
  carregando = signal(true);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  buscaId = new FormControl<number | null>(null);
 
  ngOnInit(): void {
    this.listar();
  }
 
  /** Listar estoque: todos os registros. */
  listar(): void {
    this.mensagem.set(null);
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: lista => { this.itens.set(lista); this.carregando.set(false); },
      error: e => this.falha(e),
    });
  }
 
  /** Consultar estoque por ID. */
  buscar(): void {
    const id = this.buscaId.value;
    if (!id || id < 1) { this.listar(); return; }
 
    this.mensagem.set(null);
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: item => { this.itens.set([item]); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => {
        this.itens.set([]);
        e.status === 404 ? this.naoLocalizado(id) : this.falha(e);
      },
    });
  }
 
  listarTudo(): void {
    this.buscaId.reset();
    this.listar();
  }
 
  ativo(i: EstoqueItem): boolean {
    return i.ativoProdutoServico === 'S';
  }
 
  estoqueBaixo(i: EstoqueItem): boolean {
    return i.quantidadeEstoque <= ESTOQUE_BAIXO;
  }
 
  private naoLocalizado(id: number): void {
    this.carregando.set(false);
    this.mostrar('err', `Item ${id} não localizado no estoque.`);
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else this.mostrar('err', 'Não foi possível consultar o estoque. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}

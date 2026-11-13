import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
 
import { Categoria } from '../../../model/item.model';
import { Produto, ProdutoDto } from '../../../model/produto.model';
import { CategoriaService } from '../../../service/categoria.service';
import { ProdutoService } from '../../../service/produto.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  selector: 'app-produtos',
  styleUrl: './produtos.css',
  templateUrl: './produtos.html',
}) 
export class Produtos implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ProdutoService);
  private categoriaService = inject(CategoriaService);
 
  produtos = signal<Produto[]>([]);
  categorias = signal<Categoria[]>([]);
  carregando = signal(true);
  salvando = signal(false);
  editandoId = signal<number | null>(null);     // null = cadastrando
  precoVendaEdicao = signal<number | null>(null);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  buscaId = new FormControl<number | null>(null);
 
  form = this.fb.nonNullable.group({
    item: ['', [Validators.required, Validators.maxLength(40)]],
    idcategoria: [0, [Validators.required, Validators.min(1)]],
    codigoPreco: [null as number | null],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    unidade: ['', [Validators.required, Validators.maxLength(10)]],
    ativo: ['S', Validators.required],
    descricaoItem: ['', Validators.maxLength(200)],
  });
 
  ngOnInit(): void {
    this.carregar();
  }
 
  carregar(): void {
    this.carregando.set(true);
    this.buscaId.reset();
    forkJoin({ itens: this.service.listar(), categorias: this.categoriaService.listar() }).subscribe({
      next: ({ itens, categorias }) => {
        this.categorias.set(categorias);
        this.produtos.set(itens.filter(i => i.tipoItem === 'P'));   // serviços ficam na outra tela
        this.carregando.set(false);
      },
      error: e => this.falha(e),
    });
  }
 
  nomeCategoria(id: number): string {
    return this.categorias().find(c => c.idcategoria === id)?.categoria ?? '—';
  }
 
  ativo(p: Produto): boolean {
    return p.ativoProdutoServico === 'S';
  }
 
  buscar(): void {
    const id = this.buscaId.value;
    if (!id || id < 1) { this.carregar(); return; }
 
    this.mensagem.set(null);
    this.service.buscarPorId(id).subscribe({
      next: p => {
        if (p.tipoItem !== 'P') { this.produtos.set([]); this.mostrar('err', `O item ${id} não é um produto.`); return; }
        this.produtos.set([p]);
      },
      error: (e: HttpErrorResponse) => {
        this.produtos.set([]);
        e.status === 404 ? this.mostrar('err', `Produto ${id} não localizado.`) : this.falha(e);
      },
    });
  }
 
  erro(campo: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[campo];
    if (!c.errors || !(c.touched || c.dirty)) return null;
    if (c.errors['required'] || (campo === 'idcategoria' && c.errors['min'])) return campo === 'idcategoria' ? 'Selecione uma categoria.' : 'Campo obrigatório.';
    if (c.errors['min']) return 'Informe um valor maior que zero.';
    if (c.errors['maxlength']) return `Máximo de ${c.errors['maxlength'].requiredLength} caracteres.`;
    return 'Valor inválido.';
  }
 
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrar('err', 'Corrija os campos destacados antes de salvar.');
      return;
    }
 
    const id = this.editandoId();
    this.salvando.set(true);
    const dto = this.montarDto(this.form.getRawValue());
    const req = id === null ? this.service.cadastrar(dto) : this.service.atualizar(id, dto);
 
    req.subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrar('ok', id === null ? 'Produto cadastrado com sucesso!' : 'Produto atualizado com sucesso!');
        this.cancelarEdicao();
        this.carregarMantendoMensagem();
      },
      error: e => { this.salvando.set(false); this.falha(e); },
    });
  }
 
  editar(p: Produto): void {
    this.editandoId.set(p.idItem);
    this.precoVendaEdicao.set(p.precoVenda);
    this.form.setValue({
      item: p.item,
      idcategoria: p.idcategoria,
      codigoPreco: p.codigoPreco,
      preco: p.preco,
      unidade: p.unidade,
      ativo: p.ativoProdutoServico,
      descricaoItem: p.descricaoItem ?? '',
    });
    this.mensagem.set(null);
  }
 
  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.precoVendaEdicao.set(null);
    this.limpar(false);
  }
 
  limpar(apagarMensagem = true): void {
    this.form.reset({ item: '', idcategoria: 0, codigoPreco: null, preco: 0, unidade: '', ativo: 'S', descricaoItem: '' });
    if (apagarMensagem) this.mensagem.set(null);
  }
 
  /** Não exclui: produto com movimentações ou pedidos só é desativado (ou reativado). */
  alternarSituacao(p: Produto): void {
    const desativar = this.ativo(p);
    if (desativar && !confirm(`Desativar o produto "${p.item}"?`)) return;
 
    const dto: ProdutoDto = {
      idcategoria: p.idcategoria, item: p.item, descricaoItem: p.descricaoItem, preco: p.preco,
      tipoItem: 'P', ativoProdutoServico: desativar ? 'N' : 'S', codigoPreco: p.codigoPreco, unidade: p.unidade,
    };
    this.service.atualizar(p.idItem, dto).subscribe({
      next: () => {
        this.mostrar('ok', `Produto "${p.item}" ${desativar ? 'desativado' : 'reativado'}.`);
        this.carregarMantendoMensagem();
      },
      error: e => this.falha(e),
    });
  }
 
  private montarDto(f: ReturnType<typeof this.form.getRawValue>): ProdutoDto {
    return {
      idcategoria: Number(f.idcategoria),
      item: f.item.trim(),
      descricaoItem: f.descricaoItem.trim(),
      preco: Number(f.preco),
      tipoItem: 'P',
      ativoProdutoServico: f.ativo,
      codigoPreco: f.codigoPreco === null || (f.codigoPreco as unknown) === '' ? null : Number(f.codigoPreco),
      unidade: f.unidade.trim(),
    };
  }
 
  private carregarMantendoMensagem(): void {
    const msg = this.mensagem();
    this.service.listar().subscribe({
      next: itens => { this.produtos.set(itens.filter(i => i.tipoItem === 'P')); this.mensagem.set(msg); },
      error: e => this.falha(e),
    });
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else if (e.status === 404) this.mostrar('err', 'Produto não localizado.');
    else if (e.status === 400 || e.status === 409)
      this.mostrar('err', typeof e.error === 'string' ? e.error : e.error?.message ?? 'Dados inválidos.');
    else this.mostrar('err', 'Não foi possível processar a solicitação. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}
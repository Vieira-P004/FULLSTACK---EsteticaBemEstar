
import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
 
import { Categoria } from '../../../model/item.model';
import { Servico, ServicoDto } from '../../../model/servico.model';
import { CategoriaService } from '../../../service/categoria.service';
import { ServicoService } from '../../../service/servico.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  selector: 'app-servicos',
  styleUrl: './servicos.css',
  templateUrl: './servicos.html',
})
export class Servicos implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ServicoService);
  private categoriaService = inject(CategoriaService);
 
  servicos = signal<Servico[]>([]);
  categorias = signal<Categoria[]>([]);
  carregando = signal(true);
  salvando = signal(false);
  editandoId = signal<number | null>(null);   // null = cadastrando
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  buscaId = new FormControl<number | null>(null);
 
  form = this.fb.nonNullable.group({
    item: ['', [Validators.required, Validators.maxLength(40)]],
    idcategoria: [0, [Validators.required, Validators.min(1)]],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    ativo: ['S', Validators.required],
    descricaoItem: ['', Validators.maxLength(200)],
  });
 
  ngOnInit(): void {
    this.carregar();
  }
 
  carregar(): void {
    this.carregando.set(true);
    this.buscaId.reset();
    forkJoin({ 
      itens: this.service.listar(), categorias: this.categoriaService.listar() 
    }).subscribe({
      next: ({ itens, categorias }) => {

  console.log('TODOS OS ITENS:', itens);

  console.table(itens.map(i => ({
    idItem: i.idItem,
    item: i.item,
    tipoItem: i.tipoItem
  })));

  console.log('CATEGORIAS:', categorias);

  console.table(categorias);

  this.categorias.set(categorias);
  this.servicos.set(itens.filter(i => i.tipoItem === 'S'));

  this.carregando.set(false);
},
      error: e => this.falha(e),
    });
  }
 
  nomeCategoria(id: number): string {
    return this.categorias().find(c => c.idcategoria === id)?.categoria ?? '—';
  }
 
  ativo(s: Servico): boolean {
    return s.ativoProdutoServico === 'S';
  }
 
  buscar(): void {
    const id = this.buscaId.value;
    if (!id || id < 1) { this.carregar(); return; }
 
    this.mensagem.set(null);
    this.service.buscarPorId(id).subscribe({
      next: s => {
        if (s.tipoItem !== 'S') { this.servicos.set([]); this.mostrar('err', `O item ${id} não é um serviço.`); return; }
        this.servicos.set([s]);
      },
      error: (e: HttpErrorResponse) => {
        this.servicos.set([]);
        e.status === 404 ? this.mostrar('err', `Serviço ${id} não localizado.`) : this.falha(e);
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
      console.log(
    'VALOR DA CATEGORIA:',
    this.form.controls.idcategoria.value
    );

    console.log(
    'ERROS DA CATEGORIA:',
    this.form.controls.idcategoria.errors
    );
      return;
    }
 
    const f = this.form.getRawValue();
    const dto: ServicoDto = {
      idcategoria: Number(f.idcategoria),
      item: f.item.trim(),
      descricaoItem: f.descricaoItem.trim(),
      preco: Number(f.preco),
      tipoItem: 'S',
      ativoProdutoServico: f.ativo,
    };
 
    const id = this.editandoId();
    this.salvando.set(true);
    const req = id === null ? this.service.cadastrar(dto) : this.service.atualizar(id, dto);
 
    req.subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrar('ok', id === null ? 'Serviço cadastrado com sucesso!' : 'Serviço atualizado com sucesso!');
        this.cancelarEdicao();
        this.recarregarMantendoMensagem();
      },
      error: e => { this.salvando.set(false); this.falha(e); },
    });
  }
 
  editar(s: Servico): void {
    this.editandoId.set(s.idItem);
    this.form.setValue({
      item: s.item,
      idcategoria: s.idcategoria,
      preco: s.preco,
      ativo: s.ativoProdutoServico,
      descricaoItem: s.descricaoItem ?? '',
    });
    this.mensagem.set(null);
  }
 
  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.limpar(false);
  }
 
  limpar(apagarMensagem = true): void {
    this.form.reset({ item: '', idcategoria: 0, preco: 0, ativo: 'S', descricaoItem: '' });
    if (apagarMensagem) this.mensagem.set(null);
  }
 
  /** Não exclui: serviço com pedidos registrados só é desativado (ou reativado). */
  alternarSituacao(s: Servico): void {
    const desativar = this.ativo(s);
    if (desativar && !confirm(`Desativar o serviço "${s.item}"?`)) return;
 
    const dto: ServicoDto = {
      idcategoria: s.idcategoria, item: s.item, descricaoItem: s.descricaoItem, preco: s.preco,
      tipoItem: 'S', ativoProdutoServico: desativar ? 'N' : 'S',
    };
    this.service.atualizar(s.idItem, dto).subscribe({
      next: () => {
        this.mostrar('ok', `Serviço "${s.item}" ${desativar ? 'desativado' : 'reativado'}.`);
        this.recarregarMantendoMensagem();
      },
      error: e => this.falha(e),
    });
  }
 
  private recarregarMantendoMensagem(): void {
    const msg = this.mensagem();
    this.service.listar().subscribe({
      next: itens => { this.servicos.set(itens.filter(i => i.tipoItem === 'S')); this.mensagem.set(msg); },
      error: e => this.falha(e),
    });
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else if (e.status === 404) this.mostrar('err', 'Serviço não localizado.');
    else if (e.status === 400 || e.status === 409)
      this.mostrar('err', typeof e.error === 'string' ? e.error : e.error?.message ?? 'Dados inválidos.');
    else this.mostrar('err', 'Não foi possível processar a solicitação. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}

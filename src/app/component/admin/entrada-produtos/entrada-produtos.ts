import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
 
import { Item } from '../../../model/item.model';
import { EntradaProduto } from '../../../model/entradaProduto.model';
import { CatalogoService } from '../../../service/catalogo.service';
import { EntradaProdutoService } from '../../../service/entradaProduto.service';
 
const hoje = () => new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd no fuso local
 
const naoFuturo: ValidatorFn = c => (c.value && c.value > hoje() ? { futuro: true } : null);
const inteiro: ValidatorFn = c => (c.value !== null && c.value !== '' && !Number.isInteger(+c.value) ? { inteiro: true } : null);


@Component({
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-entrada-produtos',
  styleUrl: './entrada-produtos.css',
  templateUrl: './entrada-produtos.html',
})
export class EntradaProdutos implements OnInit{
  private fb = inject(FormBuilder);
  private catalogo = inject(CatalogoService);
  private service = inject(EntradaProdutoService);
 
  produtos = signal<Item[]>([]);
  entradas = signal<EntradaProduto[]>([]);
  carregando = signal(true);
  salvando = signal(false);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  form = this.fb.nonNullable.group({
    idItem: [0, [Validators.required, Validators.min(1)]],
    dataEntrada: [hoje(), [Validators.required, naoFuturo]],
    quantidade: [1, [Validators.required, Validators.min(1), inteiro]],
    unidade: ['', [Validators.required, Validators.maxLength(10)]],
    valorUnitario: [0, [Validators.required, Validators.min(0.01)]],
  });
 
  ngOnInit(): void {
    this.carregar();
  }
 
  carregar(): void {
    this.carregando.set(true);
    forkJoin({ itens: this.catalogo.listarItens(), entradas: this.service.listar() }).subscribe({
      next: ({ itens, entradas }) => {
        // só produtos ativos recebem entrada (serviço não tem estoque)
        this.produtos.set(itens.filter(i => i.tipoItem === 'P' && i.ativoProdutoServico === 'S'));
        this.entradas.set([...entradas].sort((a, b) => b.idEntradaProduto - a.idEntradaProduto));
        this.carregando.set(false);
      },
      error: e => this.falha(e),
    });
  }
 
  nomeProduto(idItem: number): string {
    return this.produtos().find(p => p.idItem === idItem)?.item ?? `Item ${idItem}`;
  }
 
  erro(campo: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[campo];
    if (!c.errors || !(c.touched || c.dirty)) return null;
    if (c.errors['required'] || (campo === 'idItem' && c.errors['min'])) return campo === 'idItem' ? 'Selecione um produto.' : 'Campo obrigatório.';
    if (c.errors['futuro']) return 'A data não pode ser futura.';
    if (c.errors['inteiro']) return 'A quantidade deve ser um número inteiro.';
    if (c.errors['min']) return campo === 'valorUnitario' ? 'Informe um valor maior que zero.' : 'A quantidade mínima é 1.';
    if (c.errors['maxlength']) return `Máximo de ${c.errors['maxlength'].requiredLength} caracteres.`;
    return 'Valor inválido.';
  }
 
  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrar('err', 'Corrija os campos destacados antes de registrar.');
      return;
    }
 
    const f = this.form.getRawValue();
    this.salvando.set(true);
    this.service.registrar({
      idItem: Number(f.idItem),
      dataEntrada: f.dataEntrada,
      quantidadeEntrada: Number(f.quantidade),
      unidade: f.unidade.trim(),
      valorUnitarioEntrada: Number(f.valorUnitario),
    }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrar('ok', 'Entrada registrada e estoque atualizado!');
        this.limpar(false);
        this.carregar();    // o estoque é atualizado no backend; aqui só recarregamos o histórico
      },
      error: e => { this.salvando.set(false); this.falha(e); },
    });
  }
 
  limpar(apagarMensagem = true): void {
    this.form.reset({ idItem: 0, dataEntrada: hoje(), quantidade: 1, unidade: '', valorUnitario: 0 });
    if (apagarMensagem) this.mensagem.set(null);
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else if (e.status === 404) this.mostrar('err', 'Produto não localizado.');
    else if (e.status === 400 || e.status === 409)
      this.mostrar('err', typeof e.error === 'string' ? e.error : e.error?.message ?? 'Dados inválidos.');
    else this.mostrar('err', 'Não foi possível registrar a entrada. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}

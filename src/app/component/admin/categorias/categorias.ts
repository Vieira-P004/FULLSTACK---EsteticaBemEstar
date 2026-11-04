import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { Categoria } from '../../../model/item.model';
import { CategoriaService } from '../../../service/categoria.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-categorias',
  styleUrl: './categorias.css',
  templateUrl: './categorias.html',
})
export class Categorias implements OnInit {
  private service = inject(CategoriaService);
 
  categorias = signal<Categoria[]>([]);
  carregando = signal(true);
  salvando = signal(false);
  editandoId = signal<number | null>(null);       // null = cadastrando
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  nome = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(35)],
  });
  buscaId = new FormControl<number | null>(null);
 
  ngOnInit(): void {
    this.listar();
  }
 
  listar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: lista => { this.categorias.set(lista); this.carregando.set(false); },
      error: e => this.falha(e),
    });
  }
 
  /** Consulta por ID (mostra só a categoria encontrada na tabela). */
  buscar(): void {
    const id = this.buscaId.value;
    if (!id) { this.listar(); return; }
 
    this.service.buscarPorId(id).subscribe({
      next: c => { this.categorias.set([c]); this.mensagem.set(null); },
      error: (e: HttpErrorResponse) => {
        this.categorias.set([]);
        e.status === 404 ? this.mostrar('err', `Categoria ${id} não localizada.`) : this.falha(e);
      },
    });
  }
 
  limparBusca(): void {
    this.buscaId.reset();
    this.listar();
  }
 
  salvar(): void {
    const nome = this.nome.value.trim();
    if (this.nome.invalid || !nome) { this.nome.markAsTouched(); return; }
 
    const id = this.editandoId();
    const duplicada = this.categorias().some(c =>
      c.idCategoria !== id && c.categoria.toLowerCase() === nome.toLowerCase());
    if (duplicada) { this.mostrar('err', 'Já existe uma categoria com esse nome.'); return; }
 
    this.salvando.set(true);
    const req = id === null ? this.service.cadastrar(nome) : this.service.atualizar(id, nome);
 
    req.subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrar('ok', id === null ? 'Categoria cadastrada com sucesso!' : 'Categoria atualizada com sucesso!');
        this.cancelarEdicao();
        this.listar();
      },
      error: e => { this.salvando.set(false); this.falha(e); },
    });
  }
 
  editar(c: Categoria): void {
    this.editandoId.set(c.idCategoria);
    this.nome.setValue(c.categoria);
    this.mensagem.set(null);
  }
 
  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.nome.reset('');
  }
 
  excluir(c: Categoria): void {
    if (!confirm(`Excluir a categoria "${c.categoria}"?`)) return;
 
    this.service.excluir(c.idCategoria).subscribe({
      next: () => { this.mostrar('ok', 'Categoria excluída.'); this.listar(); },
      error: (e: HttpErrorResponse) => {
        // chave estrangeira: há itens usando a categoria
        if (e.status === 409 || e.status === 400 || e.status === 500)
          this.mostrar('err', `Não é possível excluir "${c.categoria}": há itens vinculados a esta categoria.`);
        else this.falha(e);
      },
    });
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else if (e.status === 404) this.mostrar('err', 'Categoria não localizada.');
    else if (e.status === 400 || e.status === 409)
      this.mostrar('err', typeof e.error === 'string' ? e.error : e.error?.message ?? 'Dados inválidos.');
    else this.mostrar('err', 'Erro ao processar a solicitação. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}

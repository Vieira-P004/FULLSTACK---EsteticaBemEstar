import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { ClienteLista } from '../../../model/clienteAdm.model';
import { ClienteService } from '../../../service/clienteAdm.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-clientes',
  styleUrl: './clientes.css',
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  private service = inject(ClienteService);
 
  clientes = signal<ClienteLista[]>([]);
  carregando = signal(true);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  buscaId = new FormControl<number | null>(null);
  termo = signal('');   // filtro rápido por nome, CPF ou e-mail dentro da lista carregada
 
  clientesFiltrados = computed(() => {
    const t = this.termo().trim().toLowerCase();
    const digitos = t.replace(/\D/g, '');
    if (!t) return this.clientes();
    return this.clientes().filter(c =>
      c.nome.toLowerCase().includes(t) ||
      c.email.toLowerCase().includes(t) ||
      (digitos.length > 0 && String(c.cpf).includes(digitos)));
  });
 
  ngOnInit(): void {
    this.listar();
  }
 
  /** Lista todos os clientes cadastrados. */
  listar(): void {
    this.mensagem.set(null);
    this.carregando.set(true);
    this.buscaId.reset();
    this.service.listar().subscribe({
      next: lista => { this.clientes.set(lista); this.carregando.set(false); },
      error: e => this.falha(e),
    });
  }
 
  /** Consulta um cliente específico por ID. */
  buscar(): void {
    const id = this.buscaId.value;
    if (!id || id < 1) { this.listar(); return; }
 
    this.mensagem.set(null);
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: lista => { this.clientes.set(lista); this.carregando.set(false); },
      error: (e: HttpErrorResponse) => {
        this.clientes.set([]);
        if (e.status === 404) { this.carregando.set(false); this.mostrar('err', `Cliente ${id} não localizado.`); }
        else this.falha(e);
      },
    });
  }
 
  ativo(c: ClienteLista): boolean {
    return c.ativoPessoa === 'S';
  }
 
  // CPF e telefone são BIGINT no banco: recompõe os zeros à esquerda e aplica a máscara
  formatarCpf(cpf: number): string {
    const s = String(cpf).padStart(11, '0');
    return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
  }
 
  formatarTelefone(tel: number): string {
    const s = String(tel);
    if (s.length === 11) return `(${s.slice(0, 2)}) ${s.slice(2, 7)}-${s.slice(7)}`;
    if (s.length === 10) return `(${s.slice(0, 2)}) ${s.slice(2, 6)}-${s.slice(6)}`;
    return s;
  }
 
  private falha(e: HttpErrorResponse): void {
    this.carregando.set(false);
    if (e.status === 0) this.mostrar('err', 'Falha de comunicação com o servidor. Verifique se a API está em execução.');
    else this.mostrar('err', 'Não foi possível consultar os clientes. Tente novamente.');
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }
}
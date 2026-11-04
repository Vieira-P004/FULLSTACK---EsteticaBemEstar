import { Component, inject, signal } from '@angular/core';

import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
 
import { ClienteService } from '../../../service/cliente.service';
import { ClienteDto } from '../../../model/cliente.model';


const soDigitos = (v: unknown) => String(v ?? '').replace(/\D/g, '');
 
/** Valida CPF pelos dígitos verificadores. */
const cpfValido: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const cpf = soDigitos(c.value);
  if (!cpf) return null; // "obrigatório" é tratado pelo Validators.required
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return { cpf: true };
 
  const dv = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += +cpf[i] * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === +cpf[9] && dv(10) === +cpf[10] ? null : { cpf: true };
};
 
const digitos = (min: number, max = min): ValidatorFn => (c) => {
  const n = soDigitos(c.value).length;
  return !c.value || (n >= min && n <= max) ? null : { digitos: true };
};
 
const naoFuturo: ValidatorFn = (c) =>
  c.value && new Date(c.value) > new Date() ? { futuro: true } : null;



@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-cad-cliente',
  styleUrl: './cad-cliente.css',
  templateUrl: './cad-cliente.html',
})
export class CadCliente {
private fb = inject(FormBuilder);
  private service = inject(ClienteService);
 
  salvando = signal(false);
  mensagem = signal<{ tipo: 'ok' | 'err'; texto: string } | null>(null);
 
  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    cpf: ['', [Validators.required, cpfValido]],
    nascimento: ['', [Validators.required, naoFuturo]],
    sexo: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    telefone: ['', [Validators.required, digitos(10, 11)]],
    cep: ['', [Validators.required, digitos(8)]],
    numero: ['', [Validators.required, Validators.maxLength(10)]],
    complemento: ['', Validators.maxLength(150)],
    // preenchidos pelo ViaCEP, apenas para exibição
    logradouro: [''],
    bairro: [''],
    cidade: [''],
    uf: [''],
  });
 
  /** Mensagem de erro do campo (só aparece depois que o usuário mexeu nele). */
  erro(campo: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[campo];
    if (!c.errors || !(c.touched || c.dirty)) return null;
    if (c.errors['required']) return 'Campo obrigatório.';
    if (c.errors['email']) return 'Informe um e-mail válido.';
    if (c.errors['cpf']) return 'CPF inválido.';
    if (c.errors['futuro']) return 'A data não pode ser futura.';
    if (c.errors['digitos']) return campo === 'cep' ? 'O CEP deve ter 8 dígitos.' : 'Informe DDD + número (10 ou 11 dígitos).';
    if (c.errors['minlength']) return `Mínimo de ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['maxlength']) return `Máximo de ${c.errors['maxlength'].requiredLength} caracteres.`;
    return 'Valor inválido.';
  }
 
  buscarCep(): void {
    const cep = soDigitos(this.form.controls.cep.value);
    if (cep.length !== 8) return;
 
    this.service.buscarCep(cep).subscribe({
      next: r => {
        if (r.erro) { this.mostrar('err', 'CEP não encontrado.'); return; }
        this.form.patchValue({
          logradouro: r.logradouro ?? '', bairro: r.bairro ?? '',
          cidade: r.localidade ?? '', uf: r.uf ?? '',
        });
      },
      error: () => { /* sem internet ou ViaCEP fora: o cadastro continua possível */ },
    });
  }
 
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrar('err', 'Corrija os campos destacados antes de salvar.');
      return;
    }
 
    const f = this.form.getRawValue();
    const cliente: ClienteDto = {
      nome: f.nome.trim(),
      cpf: Number(soDigitos(f.cpf)),
      dataNascimento: f.nascimento,
      sexo: f.sexo,
      email: f.email.trim().toLowerCase(),
      telefone: Number(soDigitos(f.telefone)),
      endereco: { cep: soDigitos(f.cep), numero: f.numero.trim(), complemento: f.complemento.trim() || null },
    };
 
    this.salvando.set(true);
    this.service.cadastrar(cliente).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrar('ok', 'Cliente cadastrado com sucesso!');
        this.limpar(false);
      },
      error: (e: HttpErrorResponse) => {
        this.salvando.set(false);
        this.mostrar('err', this.textoErro(e));
      },
    });
  }
 
  limpar(apagarMensagem = true): void {
    this.form.reset();
    if (apagarMensagem) this.mensagem.set(null);
  }
 
  private textoErro(e: HttpErrorResponse): string {
    if (e.status === 0) return 'Falha de comunicação com o servidor. Verifique se a API está em execução.';
    if (e.status === 409) return typeof e.error === 'string' ? e.error : 'CPF ou e-mail já cadastrado.';
    if (e.status === 400) {
      const msg = typeof e.error === 'string' ? e.error : e.error?.message ?? e.error?.title;
      return msg ?? 'Dados inválidos. Revise o formulário.';
    }
    return 'Não foi possível salvar o cliente. Tente novamente.';
  }
 
  private mostrar(tipo: 'ok' | 'err', texto: string): void {
    this.mensagem.set({ tipo, texto });
  }

}
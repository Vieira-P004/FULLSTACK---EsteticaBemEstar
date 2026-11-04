import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
 
import { DadosResumo, ResumoService } from '../../../service/resumo.service';
import { Router } from 'express';
 
const ESTOQUE_BAIXO = 5; // mesmo limite da tela de estoque
 
interface Indicador {
  titulo: string;
  valor: number | null;    // null = não foi possível carregar
  rota: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit{
  private service = inject(ResumoService);
 
  carregando = signal(true);
  indicadores = signal<Indicador[]>([]);
  falhas = signal(0);
 
  ngOnInit(): void {
    this.carregar();
  }
 
  carregar(): void {
    this.carregando.set(true);
    this.service.carregar().subscribe(dados => {
      this.indicadores.set(this.montar(dados));
      this.falhas.set(Object.values(dados).filter(v => v === null).length);
      this.carregando.set(false);
    });
  }
 
  private montar(d: DadosResumo): Indicador[] {
    const ativos = (tipo: string) =>
      d.itens ? d.itens.filter(i => i.tipoItem === tipo && i.ativoProdutoServico === 'S').length : null;
 
    return [
      { titulo: 'Clientes', valor: d.pessoas ? d.pessoas.length : null, rota: '/admin/clientes' },
      { titulo: 'Produtos ativos', valor: ativos('P'), rota: '/admin/produtos' },
      { titulo: 'Serviços ativos', valor: ativos('S'), rota: '/admin/servicos' },
      {
        titulo: 'Pedidos em aberto',
        valor: d.pedidos ? d.pedidos.filter(p => this.ehAberto(p.statusAtendimento)).length : null,
        rota: '/admin/pedidos-em-aberto',
      },
      {
        titulo: 'Itens com estoque baixo',
        valor: d.estoque ? d.estoque.filter(e => e.quantidadeEstoque <= ESTOQUE_BAIXO).length : null,
        rota: '/admin/estoque',
      },
    ];
  }
 
  // Ajuste conforme o valor gravado em status_atendimento
  private ehAberto(status: string): boolean {
    const s = (status ?? '').toUpperCase();
    return s === 'A' || s === 'ABERTO';
  }
}

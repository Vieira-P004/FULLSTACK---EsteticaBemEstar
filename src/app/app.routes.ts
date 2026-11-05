import { Routes } from '@angular/router';

import { Clientes } from './component/admin/clientes/clientes';
import { EntradaProdutos } from './component/admin/entrada-produtos/entrada-produtos';
import { Estoque } from './component/admin/estoque/estoque';
import { Inicio } from './component/admin/inicio/inicio';
import { PedidosEmAberto } from './component/admin/pedidos-em-aberto/pedidos-em-aberto';
import { Produtos } from './component/admin/produtos/produtos';
import { Servicos } from './component/admin/servicos/servicos';

import { CadCliente } from './component/loja/cad-cliente/cad-cliente';
import { Carrinho } from './component/loja/carrinho/carrinho';
import { Catalogo } from './component/loja/catalogo/catalogo';
import { MeusPedidos } from './component/loja/meus-pedidos/meus-pedidos';
import { Categorias } from './component/admin/categorias/categorias';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'/inicio',
        pathMatch:'full'
    },
    {
        path:'cadCliente',
        component:CadCliente
    },
    {
        path:'carrinho',
        component:Carrinho
    },
    {
        path:'catalogo',
        component:Catalogo
    },
    {
        path:'meusPedidos',
        component:MeusPedidos
    },
    {
        path:'servicos',
        component:Servicos
    },
    {
        path:'produtos',
        component:Produtos
    },
    {
        path:'pedidosEmAberto',
        component:PedidosEmAberto
    },
    {
        path:'inicio',
        component:Inicio
    },
    {
        path:'estoque',
        component:Estoque
    },
    {
        path:'entradaProdutos',
        component:EntradaProdutos
    },
    {
        path:'clientes',
        component:Clientes
    },
    {
        path:'categorias',
        component:Categorias
    }
];

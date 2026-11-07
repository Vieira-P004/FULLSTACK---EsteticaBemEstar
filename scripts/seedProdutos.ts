/**
 * Cadastra o catálogo de produtos pela API (POST /api/itens) e registra a
 * entrada inicial de estoque (POST /api/entradaprodutos).
 *
 * Uso (na raiz do projeto, com a API em execução):
 *   npx tsx scripts/seed-produtos.ts
 *
 * Para mudar a porta da API ou pular o estoque, edite as constantes abaixo.
 *
 * Pode rodar mais de uma vez: produtos que já existem (mesmo nome) são pulados.
 */

// ===== Configuração: ajuste aqui =====
const API = 'http://localhost:7248/api';   // endereço da sua API (confira a porta)
const SEM_ESTOQUE = false;                 // true = só cadastra os produtos, sem entradas de estoque
// ======================================

interface NovoProduto {
  idCategoria: number;
  item: string;            // máx. 40 caracteres
  descricaoItem: string;   // máx. 200 caracteres
  preco: number;
  unidade: string;
  qtdEntrada: number;
}

interface ItemApi {
  idItem: number;
  item: string;
}

// Categorias 13 a 20 (as de produtos)
const PRODUTOS: NovoProduto[] = [
  // 13 Cuidados Capilares
  { idCategoria: 13, item: 'Shampoo Hidratação Profunda 300ml', descricaoItem: 'Shampoo com óleo de argan para cabelos secos e ressecados.', preco: 29.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 13, item: 'Condicionador Nutritivo 300ml', descricaoItem: 'Condicionador que desembaraça e devolve maciez e brilho aos fios.', preco: 31.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 13, item: 'Máscara de Reconstrução 250g', descricaoItem: 'Tratamento intensivo que repõe massa e fortalece os fios danificados.', preco: 54.9, unidade: 'un', qtdEntrada: 25 },
  { idCategoria: 13, item: 'Óleo Reparador de Pontas 60ml', descricaoItem: 'Óleo leve que sela as pontas duplas e controla o frizz.', preco: 39.9, unidade: 'un', qtdEntrada: 30 },
  // 14 Produtos Faciais
  { idCategoria: 14, item: 'Gel de Limpeza Facial 150ml', descricaoItem: 'Gel de limpeza suave para remover impurezas e oleosidade da pele.', preco: 32.9, unidade: 'un', qtdEntrada: 35 },
  { idCategoria: 14, item: 'Sérum Vitamina C 30ml', descricaoItem: 'Sérum antioxidante que uniformiza o tom e ilumina a pele.', preco: 79.9, unidade: 'un', qtdEntrada: 20 },
  { idCategoria: 14, item: 'Creme Hidratante Facial 50g', descricaoItem: 'Hidratação diária com ácido hialurônico para todos os tipos de pele.', preco: 59.9, unidade: 'un', qtdEntrada: 30 },
  { idCategoria: 14, item: 'Água Micelar 200ml', descricaoItem: 'Remove maquiagem e limpa sem agredir. Não precisa enxaguar.', preco: 27.9, unidade: 'un', qtdEntrada: 40 },
  // 15 Produtos Corporais
  { idCategoria: 15, item: 'Creme Hidratante Corporal 400ml', descricaoItem: 'Hidratação por 24 horas com manteiga de karité e textura leve.', preco: 34.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 15, item: 'Óleo Corporal de Amêndoas 120ml', descricaoItem: 'Óleo vegetal para massagem e hidratação, deixa a pele macia e perfumada.', preco: 45.0, unidade: 'un', qtdEntrada: 25 },
  { idCategoria: 15, item: 'Esfoliante Corporal de Açúcar 250g', descricaoItem: 'Esfoliante que remove células mortas e renova a pele do corpo.', preco: 42.9, unidade: 'un', qtdEntrada: 25 },
  { idCategoria: 15, item: 'Loção Pós-Depilação 200ml', descricaoItem: 'Loção calmante que reduz a vermelhidão e retarda o crescimento dos pelos.', preco: 28.9, unidade: 'un', qtdEntrada: 30 },
  // 16 Produtos Capilares
  { idCategoria: 16, item: 'Finalizador para Cachos 250ml', descricaoItem: 'Define e modela os cachos com controle de frizz e brilho.', preco: 36.9, unidade: 'un', qtdEntrada: 30 },
  { idCategoria: 16, item: 'Spray Fixador de Penteado 300ml', descricaoItem: 'Fixação forte com acabamento natural e sem deixar os fios duros.', preco: 24.9, unidade: 'un', qtdEntrada: 30 },
  { idCategoria: 16, item: 'Tônico Antiqueda 100ml', descricaoItem: 'Tônico capilar que estimula o couro cabeludo e ajuda a reduzir a queda.', preco: 64.9, unidade: 'un', qtdEntrada: 20 },
  { idCategoria: 16, item: 'Shampoo Anticaspa 250ml', descricaoItem: 'Controla a caspa e a oleosidade, com sensação de frescor.', preco: 26.9, unidade: 'un', qtdEntrada: 35 },
  // 17 Maquiagem
  { idCategoria: 17, item: 'Base Líquida Matte', descricaoItem: 'Base de alta cobertura com acabamento matte e longa duração.', preco: 49.9, unidade: 'un', qtdEntrada: 25 },
  { idCategoria: 17, item: 'Batom Líquido Nude', descricaoItem: 'Batom de longa duração com cor intensa e acabamento aveludado.', preco: 27.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 17, item: 'Máscara de Cílios Volume', descricaoItem: "Máscara à prova d'água que dá volume e define os cílios.", preco: 32.9, unidade: 'un', qtdEntrada: 35 },
  { idCategoria: 17, item: 'Paleta de Sombras 12 Cores', descricaoItem: 'Paleta com tons neutros e vibrantes, acabamento matte e cintilante.', preco: 69.9, unidade: 'un', qtdEntrada: 20 },
  // 18 Protetores Solares
  { idCategoria: 18, item: 'Protetor Solar Facial FPS 50', descricaoItem: 'Protetor facial de toque seco, indicado para pele oleosa e mista.', preco: 54.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 18, item: 'Protetor Solar Corporal FPS 30', descricaoItem: 'Protetor resistente à água com hidratação e proteção UVA/UVB.', preco: 39.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 18, item: 'Protetor Solar com Cor FPS 60', descricaoItem: 'Protege e uniformiza o tom da pele, substitui a base no dia a dia.', preco: 64.9, unidade: 'un', qtdEntrada: 25 },
  { idCategoria: 18, item: 'Protetor Labial FPS 30', descricaoItem: 'Hidrata e protege os lábios contra o ressecamento e o sol.', preco: 14.9, unidade: 'un', qtdEntrada: 50 },
  // 19 Cosméticos
  { idCategoria: 19, item: 'Hidratante Labial de Cacau', descricaoItem: 'Bastão hidratante com manteiga de cacau, para lábios macios.', preco: 12.9, unidade: 'un', qtdEntrada: 50 },
  { idCategoria: 19, item: 'Esmalte Cremoso Vermelho', descricaoItem: 'Esmalte de secagem rápida e alta cobertura, com brilho intenso.', preco: 9.9, unidade: 'un', qtdEntrada: 60 },
  { idCategoria: 19, item: 'Creme para as Mãos 80g', descricaoItem: 'Creme hidratante de rápida absorção, não deixa a pele oleosa.', preco: 18.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 19, item: 'Body Splash Frutas Vermelhas 200ml', descricaoItem: 'Fragrância refrescante e suave para usar todos os dias.', preco: 44.9, unidade: 'un', qtdEntrada: 30 },
  // 20 Acessórios de Beleza
  { idCategoria: 20, item: 'Esponja de Maquiagem Gota', descricaoItem: 'Esponja macia para aplicar base e corretivo com acabamento uniforme.', preco: 11.9, unidade: 'un', qtdEntrada: 60 },
  { idCategoria: 20, item: 'Kit 8 Pincéis de Maquiagem', descricaoItem: 'Kit com pincéis de cerdas macias para rosto e olhos, com estojo.', preco: 59.9, unidade: 'un', qtdEntrada: 20 },
  { idCategoria: 20, item: 'Pinça Profissional para Sobrancelha', descricaoItem: 'Pinça de aço inox com ponta inclinada de alta precisão.', preco: 19.9, unidade: 'un', qtdEntrada: 40 },
  { idCategoria: 20, item: 'Escova Facial de Limpeza', descricaoItem: 'Escova com cerdas macias que potencializa a limpeza e esfoliação.', preco: 49.9, unidade: 'un', qtdEntrada: 20 },
];

async function chamar(metodo: string, rota: string, corpo?: unknown): Promise<any> {
  const resp = await fetch(`${API}${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const texto = await resp.text();
  if (!resp.ok) throw new Error(`${metodo} ${rota} → HTTP ${resp.status} ${texto.slice(0, 300)}`);
  return texto ? JSON.parse(texto) : null;
}

async function main(): Promise<void> {
  console.log(`API: ${API}`);
  const existentes = new Set<string>(((await chamar('GET', '/itens')) as ItemApi[]).map(i => i.item.toLowerCase()));

  // 1) cadastra os itens que ainda não existem
  const criados: NovoProduto[] = [];
  for (const p of PRODUTOS) {
    if (existentes.has(p.item.toLowerCase())) { console.log(`  pulado (já existe): ${p.item}`); continue; }
    await chamar('POST', '/itens', {
      idCategoria: p.idCategoria,
      item: p.item,
      descricaoItem: p.descricaoItem,
      preco: p.preco,
      tipoItem: 'P',
      ativoProdutoServico: 'S',
      codigoPreco: 1,           // suposição: confira a função de preço de venda
      unidade: p.unidade,
    });
    criados.push(p);
    console.log(`  cadastrado: ${p.item}`);
  }
  console.log(`${criados.length} produto(s) cadastrado(s).`);

  if (SEM_ESTOQUE || criados.length === 0) return;

  // 2) descobre os IDs gerados e registra a entrada inicial (o trigger atualiza o estoque)
  const ids = new Map<string, number>(((await chamar('GET', '/itens')) as ItemApi[]).map(i => [i.item.toLowerCase(), i.idItem]));
  const hoje = new Date().toLocaleDateString('en-CA');   // yyyy-MM-dd

  let entradas = 0;
  for (const p of criados) {
    const idItem = ids.get(p.item.toLowerCase());
    if (!idItem) { console.warn(`  sem ID para "${p.item}", entrada ignorada`); continue; }
    await chamar('POST', '/entradaprodutos', {
      idItem,
      dataEntrada: hoje,
      quantidadeEntrada: p.qtdEntrada,
      unidade: p.unidade,
      valorUnitarioEntrada: p.preco,
    });
    entradas++;
  }
  console.log(`${entradas} entrada(s) de estoque registrada(s).`);
}

main().catch(e => {
  console.error(`\nErro: ${e.message}`);
  console.error('Confira se a API está em execução, a porta (constante API) e os nomes dos campos do DTO.');
});
# Venprox — ordem de construção do frontend

**Total inicial: 25 unidades de interface — 1 estrutura, 11 páginas, 12 modais/painéis e 1 assistente opcional.** Não são 25 páginas na barra lateral: existem **8 destinos principais**. T00, T01, T02 e T03 estão implementadas; o fluxo usa dados fictícios em memória. As demais continuam planejadas.

## Como se conectam

A barra lateral é persistente. Vendas, Clientes, Produtos, Estoque, Contas a Pagar, Caixa e Relatórios aparecem nessa ordem; Configurações fica na parte inferior. T02 (venda), T17 (fiado) e T23 (envios) são páginas internas, sem novos itens na barra. Modais/painéis retornam à origem e restauram foco/contexto.

- Vendas T01 → Nova Venda T02 → Pagamento T03 → Confirmação T04 → Nova Venda ou Histórico. Histórico → Detalhe T05.
- Caixa T07 → Abertura T06, Movimento T08 ou Fechamento T09. Nova Venda sem sessão passa por T06 e retoma sua origem.
- Produtos T10 → Cadastro T11 → Categorias T12, ou categorias diretamente da lista.
- Estoque T13 → Entrada/Ajuste T14; movimentos históricos são aba/painel da própria página.
- Clientes T15 → Cadastro T16 ou Fiado T17 → Lançamento T18. Escolha de cliente a partir da venda retorna à venda.
- Contas a Pagar T19 → Cadastro/edição T20. Toast de lembrete é componente transversal, não nova página.
- Relatórios T21 → Detalhe de Venda T05 quando necessário.
- Configurações T22 → Envios T23; Recuperação T24 somente se RF24/E9 for escolhida.

## Arquivos por tela e ordem de implementação

A ordem abaixo é de construção visual, não a ordem obrigatória de uso da loja. Ao conectar o serviço real, abrir caixa continua sendo pré-requisito de venda. Cada arquivo contém entrada, composição, ações, retorno e critérios de aceite.

| Ordem | Unidade | Tipo | Arquivo descritivo | Estado |
| --- | --- | --- | --- | --- |
| 00 | T00 — Estrutura e navegação | estrutura | [00-estrutura.md](telas/00-estrutura.md) | Base pronta |
| 01 | T01 — Histórico de vendas | página | [01-vendas.md](telas/01-vendas.md) | FEITO - 20/11/2026 (simulação) |
| 02 | T02 — Montagem da venda | página | [02-nova-venda.md](telas/02-nova-venda.md) | FEITO - 20/11/2026 (simulação) |
| 03 | T03 — Conferência de pagamento | modal | [03-pagamento.md](telas/03-pagamento.md) | FEITO - 20/11/2026 (simulação) |
| 04 | T04 — Confirmação da venda | modal | [04-confirmacao-venda.md](telas/04-confirmacao-venda.md) | Planejada |
| 05 | T05 — Detalhe, cancelamento e comprovante | painel | [05-detalhe-venda.md](telas/05-detalhe-venda.md) | Planejada |
| 06 | T06 — Abertura de caixa | modal | [06-abertura-caixa.md](telas/06-abertura-caixa.md) | Planejada |
| 07 | T07 — Caixa atual e anteriores | página | [07-caixa.md](telas/07-caixa.md) | Planejada |
| 08 | T08 — Suprimento e sangria | modal | [08-movimento-caixa.md](telas/08-movimento-caixa.md) | Planejada |
| 09 | T09 — Conferência e fechamento | modal | [09-fechamento-caixa.md](telas/09-fechamento-caixa.md) | Planejada |
| 10 | T10 — Lista de produtos | página | [10-produtos.md](telas/10-produtos.md) | Planejada |
| 11 | T11 — Cadastro e edição de produto | modal | [11-produto-editor.md](telas/11-produto-editor.md) | Planejada |
| 12 | T12 — Gerenciamento de categorias | painel | [12-categorias.md](telas/12-categorias.md) | Planejada |
| 13 | T13 — Saldo e movimentos de estoque | página | [13-estoque.md](telas/13-estoque.md) | Planejada |
| 14 | T14 — Entrada e ajuste de estoque | modal | [14-movimento-estoque.md](telas/14-movimento-estoque.md) | Planejada |
| 15 | T15 — Lista de clientes | página | [15-clientes.md](telas/15-clientes.md) | Planejada |
| 16 | T16 — Cadastro mínimo de cliente | modal | [16-cliente-editor.md](telas/16-cliente-editor.md) | Planejada |
| 17 | T17 — Fiado manual do cliente | página | [17-fiado.md](telas/17-fiado.md) | Planejada |
| 18 | T18 — Ajuste e quitação de fiado | modal | [18-fiado-lancamento.md](telas/18-fiado-lancamento.md) | Planejada |
| 19 | T19 — Agenda de contas a pagar | página | [19-contas-a-pagar.md](telas/19-contas-a-pagar.md) | Planejada |
| 20 | T20 — Cadastro de lembrete | modal | [20-lembrete-editor.md](telas/20-lembrete-editor.md) | Planejada |
| 21 | T21 — Resumo e relatórios | página | [21-relatorios.md](telas/21-relatorios.md) | Planejada |
| 22 | T22 — Configurações do sistema | página | [22-configuracoes.md](telas/22-configuracoes.md) | Planejada |
| 23 | T23 — Status de envio e suporte | página | [23-status-envios.md](telas/23-status-envios.md) | Planejada |
| 24 | T24 — Reutilização e recuperação de dados | assistente opcional | [24-recuperacao.md](telas/24-recuperacao.md) | Planejada |

## Entrega atual e próximo passo

T00: React + TypeScript + Vite, ícones próprios, barra lateral clara, links por hash com seleção ativa e recolhimento. T01 contém histórico e prévias; T02 permite montar rascunho; T03 confere pagamentos/troco e inclui uma venda simulada no Histórico. Dados apenas em memória, identificados como fictícios. As outras sete áreas continuam com centro vazio. Não há persistência, caixa/cobrança ou integração real.

**Próxima tela: T04, Confirmação da Venda.** T01 → T02 → T03 já permite montar e concluir uma venda simulada, retornando provisoriamente ao Histórico com mensagem e um novo registro em memória. T05 continua planejada, com apenas prévia informativa; T06 não foi antecipada, usando cenário explícito de caixa aberto/fechado para exercitar T02/T03. Seguir por unidade preservando a estrutura comum.

## Ciclo de trabalho para cada tela

1. Ler este roteiro, a especificação da unidade, [docs/frontend.md](../docs/frontend.md) e a captura correspondente.
2. Implementar composição, navegação/retorno e estados com dados fictícios quando necessários. Não misturar cliente do fiado e conexão Google.
3. Validar resolução, foco/teclado e fluxo com a tela anterior. Não deixar botão sem ação aparentar recurso funcional.
4. Revisar com o responsável antes de ampliar o fluxo; manter o escopo de uma unidade por incremento.
5. Após implementar e validar navegação/simulação, colocar `FEITO - DATA ATUAL` na primeira linha do Markdown da unidade e atualizar este quadro; registrar comportamentos simulados e limitações para outra IA continuar.

## Padrões compartilhados para as próximas telas

- **Cores:** [src/theme.css](src/theme.css) é a paleta global, importada por `src/index.css`. Usar variáveis semânticas como `var(--color-accent)` e `var(--color-text)` nos estilos. Alterar a variável atualiza seus usos; criar novos tons nesse arquivo, sem repetir cores literais nas telas.
- **Ícones:** [src/ui/AppIcon.tsx](src/ui/AppIcon.tsx) contém o catálogo SVG e o mapa de pagamentos. Usar `AppIcon` para ações/navegação e `PaymentIcon` para meios de pagamento. Trocar o desenho no catálogo atualiza todas as ocorrências desse ícone; trocar o mapa de pagamento atualiza Histórico e conferência. Novas telas devem importar esses componentes, sem copiar SVG ou usar caracteres como ícones. Símbolos textuais de quantidade/moeda continuam sendo texto.
- **Pagamento por teclado:** na T03, ↑/↓ selecionam o meio e transferem o total quando o pagamento está concentrado em um único meio. Se já houver divisão, preservam os valores e movem o foco; Tab permite edição livre. Não ampliar esse atalho para fora do modal nem remover o bloqueio de confirmação duplicada.

Atualização de 20/11/2026: paleta e ícones unificados nas telas existentes; navegação da T03 validada no navegador. T04 continua planejada.

## Defaults e limites que devem acompanhar as telas

- Venda sem estoque e item avulso permitidos por padrão, sem avisos repetitivos; modo estrito exige cadastro/saldo.
- Fiado manual fora da finalização da venda, com caixa opcional; contas a pagar são lembretes persistidos, sem saída automática.
- Impressão automática e fotos/Drive desligadas; nenhuma integração bancária/fiscal nesta versão.
- Conexão, sessão de caixa e persistência não são simuladas como reais nesta base visual. Futuro serviço confirma sucesso; React sozinho não oferece durabilidade offline.
- Não criar menu Nota Fiscal, Catálogo Online, pedidos, orçamentos, balança, comissão ou validade só por aparecer no legado: escopo ainda condicionado.
- Fotos são parte futura de T11/T22 (E10), não novas telas obrigatórias. T24 é opcional (E9). Login, primeiro provisionamento, usuários detalhados e extensões ainda não descritas ganham especificações próprias quando esse escopo for definido; não estão ocultamente incluídos nesta contagem.

## Executar a base visual

Requisito: Node compatível com o projeto (ambiente usado: Node 24). No terminal, dentro de `front-Venprox`:

```powershell
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1
```

Abrir o endereço informado pelo Vite. Verificações: `npm.cmd run build` e `npm.cmd run lint`. Esta base ainda não é um instalador Electron nem um PDV utilizável em produção.

## Referências e continuidade

Verificação desta entrega em 20/11/2026: build TypeScript/Vite e lint aprovados; navegador Edge validou os 8 destinos, voltar, recarregar mantendo seção, recolhimento/expansão e atalho de foco ao conteúdo, sem erros de página. Conferidas larguras 1366, 1920 e 375 px sem rolagem horizontal. As 25 especificações e seus links locais foram conferidos. Isso valida somente a estrutura visual, não fluxos de negócio ou operação offline real.

Documentação principal em [docs/LEIA-ME.md](../docs/LEIA-ME.md), [frontend](../docs/frontend.md), [decisões](../docs/decisoes-e-pendencias.md) e [imagens](../LayoutPrograma/). Os 8 guias gerais continuam em docs; as especificações locais desta pasta são um detalhamento autorizado para desenvolver por tela.

Base de ferramentas: [React](https://react.dev/learn) e [Vite](https://vite.dev/guide/). A escolha inicial segue o guia existente; não decide a camada desktop/servidor. Autorização atual: iniciar frontend e navegação; não implantar, integrar bancos ou conectar serviços.


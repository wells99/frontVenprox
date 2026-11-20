FEITO - 20/11/2026

# T01 — Histórico de vendas

**Tipo:** página. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 1. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Vendas. Saídas relacionadas: T02, T05, T06. Referência: S01; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Título Vendas, Nova Venda F3, busca/filtros e lista: número, data/hora, resumo, meio, total, cliente, operador e envio.

## Interações e retorno

Nova venda/F3 abre o ponto de entrada reservado à T02; abrir/F2 ou duplo clique mostra uma prévia de consulta do registro, reservando o detalhe completo para T05. Escape/Voltar fecham a prévia; o histórico mantém filtros e paginação. Cancelar será ação distinta e autorizada no detalhe completo, ainda não implementado.

## Regras e aceite visual

Tabela vazia e estado de carregamento/erro previstos; navegação por teclado. Pedido/orçamento não são botões funcionais até definir escopo.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementada isoladamente na estrutura T00, em `src/features/sales/SalesHistory.tsx`, com estilos em `sales.css` e 24 registros fictícios em `demoSales.ts`. T02/T05 não foram implementadas por antecipação: o ponto de entrada de nova venda apenas explica a etapa seguinte; a prévia consulta os dados fictícios, sem cancelamento ou impressão. Nenhuma venda é criada, gravada ou enviada por esta tela.

## Simulações disponíveis

- Busca por número, produto, cliente e operador, ignorando acentos/maiúsculas.
- Filtros combináveis de caixa, pagamento, situação, envio e período; validação de intervalo inválido e limpeza dos filtros.
- Ordenação por recentes, antigas ou maior valor; oito linhas por página, seleção destacada, setas e F2/F3, inclusive a partir da busca.
- Total das concluídas no filtro exclui canceladas; situação e envio estão identificados como fictícios.
- Prévia de registro, entrada reservada à nova venda, Escape, retorno e acesso direto por hash; filtros sobrevivem à troca de seção durante a sessão.
- Lista vazia por busca/filtro. Em “Cenários de demonstração”, simular carregamento e falha; Tentar novamente preserva filtros.

## Validação realizada

Em 20/11/2026: build TypeScript/Vite e lint aprovados; fluxo em Edge validou busca, paginação, filtros, datas inválidas, ordenação, total sem canceladas, setas/F2/F3, foco após Escape, voltar/recarregar/acesso direto e estados de carregamento/falha/retentativa. Conferidas larguras 1366, 1920 e 375 px, sem rolagem horizontal da página; tabela tem rolagem própria quando necessária. Sem erros de página no fluxo verificado.

Dados ficam apenas em memória e reiniciam ao recarregar. Persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real. Próxima unidade: [T02 — Nova venda](02-nova-venda.md).


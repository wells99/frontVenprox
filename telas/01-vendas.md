FEITO - 20/11/2026

# T01 — Histórico de vendas

**Tipo:** página. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 1. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Vendas. Saídas relacionadas: T02, T05, T06. Referência: S01; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Título Vendas, Nova Venda F3, busca/filtros e lista: número, data/hora, resumo, meio, total, cliente, operador e envio.

## Interações e retorno

Nova venda/F3 abre a T02 implementada; abrir/F2 ou duplo clique abre o painel de detalhe T05. Escape/Voltar fecham o detalhe; o histórico mantém filtros, ordenação e paginação, restaurando o foco à venda quando ela continua visível. Cancelar é ação distinta na T05, com motivo obrigatório e permissão simulada.

## Regras e aceite visual

Tabela vazia e estado de carregamento/erro previstos; navegação por teclado. Pedido/orçamento não são botões funcionais até definir escopo.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementada na estrutura T00, em `src/features/sales/SalesHistory.tsx`, com estilos em `sales.css` e 24 registros fictícios iniciais em `demoSales.ts`. Após a entrega de T02/T03, o Histórico também recebe vendas concluídas na simulação, com desconto e meio Misto quando aplicável. A T05 substitui a prévia inicial e mostra valores, pagamentos/troco e observação, além de cancelamento e prévia/impressão simulada de comprovante não fiscal. Canceladas continuam consultáveis e não entram no total das concluídas. Nada é gravado em banco ou enviado.

## Simulações disponíveis

- Busca por número, produto, cliente e operador, ignorando acentos/maiúsculas.
- Filtros combináveis de caixa, pagamento, situação, envio e período; validação de intervalo inválido e limpeza dos filtros.
- Ordenação por recentes, antigas ou maior valor; oito linhas por página, seleção destacada, setas e F2/F3, inclusive a partir da busca.
- Total das concluídas no filtro exclui canceladas; situação e envio estão identificados como fictícios.
- Prévia de registro, acesso à montagem de nova venda, Escape, retorno e acesso direto por hash; filtros sobrevivem à troca de seção durante a sessão. Nova venda simulada respeita os filtros ainda ativos, podendo exigir limpeza para aparecer.
- Lista vazia por busca/filtro. Em “Cenários de demonstração”, simular carregamento e falha; Tentar novamente preserva filtros.

## Validação realizada

Em 20/11/2026: build TypeScript/Vite e lint aprovados; fluxo em Edge validou busca, paginação, filtros, datas inválidas, ordenação, total sem canceladas, setas/F2/F3, foco após Escape, voltar/recarregar/acesso direto e estados de carregamento/falha/retentativa. Conferidas larguras 1366, 1920 e 375 px, sem rolagem horizontal da página; tabela tem rolagem própria quando necessária. Sem erros de página no fluxo verificado.

Dados ficam apenas em memória e reiniciam ao recarregar. Persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real. [T02 — Nova venda](02-nova-venda.md) e [T03 — Pagamento](03-pagamento.md) estão conectadas; a próxima unidade do roteiro é T04.


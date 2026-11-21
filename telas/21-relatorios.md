FEITO - 20/11/2026 (simulação)

# T21 — Resumo e relatórios

**Tipo:** página. **Estado:** implementada em memória. **Ordem:** 21. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Relatórios. Saídas relacionadas: T05. Referência: S07; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Período e critério no alto, cartões, gráfico e detalhe; vendas/estornos, meios, estoque e custos conhecidos.

## Interações e retorno

Filtrar e detalhar dentro desta tela; consultar venda → T05.

## Regras e aceite visual

Faturamento inclui avulsos; recebimento de fiado não é venda; lucro estimado informa cobertura de custo; abrangência local/remota explícita.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Resumo, vendas/estornos, meios e estoque atual. Período inclusivo e critérios explícitos: data da venda com situação atual ou data de cada venda/cancelamento. Cartões de faturamento líquido, quantidade, ticket e resultado bruto parcial. Gráfico por hora/dia detalha a faixa na própria tela. T05 abre e volta ao relatório preservando filtros/foco; cancelamento atualiza a mesma base de vendas/caixa.

Fiado recebido/revertido no caixa aparece separado de vendas, sem incluir abertura/suprimento/sangria. Troco não vira receita; avulsos entram no faturamento. Resultado parcial usa somente snapshots de custo dos itens, com desconto rateado exatamente em centavos e cobertura de custo explícita. Custo zero conhecido e desconhecido são distintos; alterar cadastro não reescreve custos históricos. Fixtures de vendas possuem custos fictícios explícitos; novas vendas capturam custo ao adicionar o item ao rascunho. Estoque é saldo cadastral atual, sem reconstrução histórica ou custo médio.

Build/lint e seis testes específicos aprovados; navegador validou resumo, faixa do gráfico, detalhe/retorno e estoque negativo sem custo. Estados de período inválido, vazio, carregamento e falha são simuláveis. Dados somente em memória do Balcão 01, sem consulta remota, exportação ou lucro líquido. Não há conciliação bancária, fiscal ou persistência.

Conferência final T21/T22: 41 testes totais aprovados, incluindo seis específicos de relatórios e quatro de preferências/política/impressão simulada. No navegador, cancelamento de venda a partir da T05 atualizou os totais do relatório e a sessão compartilhada sem repetir a operação; período inválido, consulta vazia e falha/retry foram conferidos. Layouts 1366×768, 1920×1080 e largura 375 validados com tabelas/gráfico roláveis na própria região e sem rolagem horizontal da página. Captura em `../artifacts/t21-relatorios.jpg`. A configuração T22 alimenta a política da T02; as novas vendas continuam preservando custo/preço do rascunho para a T21.

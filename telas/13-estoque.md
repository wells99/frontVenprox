# T13 — Saldo e movimentos de estoque

**Tipo:** página. **Estado:** especificada, não implementada. **Ordem:** 13. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Estoque. Saídas relacionadas: T14. Referência: S03; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Busca, produto, unidade, saldo, custo conhecido e consulta de movimentos.

## Interações e retorno

Entrada/ajuste → T14; consultar histórico como aba/painel desta tela.

## Regras e aceite visual

Saldo negativo consultável sem toast obrigatório; item avulso não cria produto fictício. Validade/lotes só após confirmação.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


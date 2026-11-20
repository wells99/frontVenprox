# T19 — Agenda de contas a pagar

**Tipo:** página. **Estado:** especificada, não implementada. **Ordem:** 19. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Contas a Pagar. Saídas relacionadas: T20. Referência: S05 + simplificação confirmada; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Próximas, vencidas e resolvidas; descrição, valor informativo, data/hora e recorrência.

## Interações e retorno

Criar/editar/adiar → T20; resolver ocorrência; interromper série.

## Regras e aceite visual

Agenda não cria despesa nem saída de caixa. Toast no horário não rouba foco; atraso recuperado ao reabrir sem rajada.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


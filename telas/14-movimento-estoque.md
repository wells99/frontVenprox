# T14 — Entrada e ajuste de estoque

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 14. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Estoque → Entrada/Ajuste. Saídas relacionadas: T13. Referência: S03 + guia de dados; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Produto, unidade, tipo, quantidade, custo quando conhecido e motivo.

## Interações e retorno

Confirmar → T13 atualizado pelo adaptador; cancelar sem gerar movimento.

## Regras e aceite visual

Ajuste absoluto gera diferença auditável; permissão/motivo e prevenção de repetição.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


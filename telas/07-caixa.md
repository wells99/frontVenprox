# T07 — Caixa atual e anteriores

**Tipo:** página. **Estado:** especificada, não implementada. **Ordem:** 7. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Caixa. Saídas relacionadas: T06, T08, T09. Referência: S06; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Abas atual/anteriores, resumo, dinheiro esperado, meios digitais separados, movimentos e fechar caixa.

## Interações e retorno

Abrir → T06; suprimento/sangria → T08; fechar → T09; consultar sessão anterior em aba.

## Regras e aceite visual

Pix/cartão não contam como dinheiro físico. Fiado recebido com caixa aparece separado de vendas; lembretes não entram no saldo.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


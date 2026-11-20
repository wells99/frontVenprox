# T18 — Ajuste e quitação de fiado

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 18. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Fiado → Aumentar/Diminuir/Quitar. Saídas relacionadas: T17, T06. Referência: Orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Tipo (correção/recebimento), valor, motivo, quitação total/parcial; no recebimento, meio e Registrar no caixa inicialmente desmarcado.

## Interações e retorno

Prévia do saldo e efeito no caixa; salvar → T17; com caixa fechado orientar T06 sem perder contexto.

## Regras e aceite visual

Não reduzir além da dívida; opção sem caixa não gera movimento; sessão exigida quando marcada. Reversão identificada.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


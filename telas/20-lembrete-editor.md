# T20 — Cadastro de lembrete

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 20. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Contas a Pagar → Nova conta/Editar. Saídas relacionadas: T19. Referência: Orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Descrição, valor, data, hora, recorrente e frequência/intervalo quando aplicável.

## Interações e retorno

Salvar/cancelar → T19; edição diferencia ocorrência atual e futuras quando recorrente.

## Regras e aceite visual

Persistir regra/ocorrência local e remotamente quando implementado; mês curto não desloca definitivamente o dia-âncora. Detalhes em P14.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


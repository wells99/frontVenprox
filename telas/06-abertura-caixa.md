# T06 — Abertura de caixa

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 6. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Caixa fechado ou Nova Venda sem sessão. Saídas relacionadas: T02, T07. Referência: S06 + orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Valor existente na gaveta, identificação de terminal/operador; zero precisa ser informado explicitamente.

## Interações e retorno

Abrir → retomar origem T02 ou T07; cancelar não inicia venda nem abre sessão oculta.

## Regras e aceite visual

Uma sessão por terminal; erros mantêm valor; acesso por teclado; abertura real depende de serviço futuro.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


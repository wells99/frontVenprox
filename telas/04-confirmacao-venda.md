# T04 — Confirmação da venda

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 4. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Pagamento → sucesso confirmado. Saídas relacionadas: T01, T02. Referência: S10; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Valor, número legível, mensagem Venda feita, iniciar nova venda e fechamento; impressão manual quando disponível.

## Interações e retorno

Iniciar Nova Venda → T02 vazio; fechar → T01; imprimir/reimprimir a mesma venda.

## Regras e aceite visual

Erro de envio ou impressão não volta ao pagamento; distinguir salva localmente/pendente. Protótipo nunca se apresenta como comprovante de gravação real.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


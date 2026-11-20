# T03 — Conferência de pagamento

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 3. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Nova Venda → Concluir/F2. Saídas relacionadas: T02, T04. Referência: S09; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Total destacado, dinheiro/crédito/débito/Pix manuais, dinheiro recebido/troco e divisão entre meios.

## Interações e retorno

Voltar → T02 preservando itens; confirmar → estado de salvamento e T04 somente após sucesso do adaptador.

## Regras e aceite visual

Cobertura exata do total; troco apenas no dinheiro. Soltar F2 antes de novo acionamento. Não indicar aprovação bancária nem oferecer fiado automático.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


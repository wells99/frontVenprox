# T02 — Montagem da venda

**Tipo:** página. **Estado:** especificada, não implementada. **Ordem:** 2. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Vendas → Nova Venda. Saídas relacionadas: T03, T06, T15. Referência: S08, S09; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Busca no alto, quantidade, resultados e itens no centro, resumo à direita, total e concluir no rodapé. Item avulso: descrição, quantidade e preço.

## Interações e retorno

Adicionar por Enter, alterar/remover item, cliente opcional, observação e desconto autorizado; F2 → T03. Sem caixa aberto → T06.

## Regras e aceite visual

Modo permissivo aceita avulso/saldo negativo sem alerta; estrito exige produto/saldo. Preço do item não muda silenciosamente. Rascunho e retorno precisam de contrato futuro de persistência.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


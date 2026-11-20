# T15 — Lista de clientes

**Tipo:** página. **Estado:** especificada, não implementada. **Ordem:** 15. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Clientes. Saídas relacionadas: T16, T17, T02. Referência: S04; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Busca, adicionar, nome e saldo de fiado quando complemento existir; venda anônima segue permitida.

## Interações e retorno

Adicionar/editar → T16; abrir fiado → T17; seleção a partir da venda retorna T02.

## Regras e aceite visual

Sem CPF/endereço obrigatórios por padrão; lista vazia orienta cadastro; cliente não é obrigatório na venda comum.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


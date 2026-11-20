# T10 — Lista de produtos

**Tipo:** página. **Estado:** especificada, não implementada. **Ordem:** 10. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Produtos. Saídas relacionadas: T11, T12. Referência: S02; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Busca, categorias, adicionar e tabela com nome, código, preço, saldo e ativo; sem categoria obrigatório.

## Interações e retorno

Adicionar/editar/F2 → T11; categorias → T12; pesquisa por nome/código/barcode.

## Regras e aceite visual

Custo desconhecido não vira zero; lista vazia utilizável; fotos não são requisito nem habilitadas no núcleo.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


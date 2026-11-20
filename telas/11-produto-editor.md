# T11 — Cadastro e edição de produto

**Tipo:** modal. **Estado:** especificada, não implementada. **Ordem:** 11. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Produtos → Adicionar/Editar. Saídas relacionadas: T10, T12. Referência: S02 + guia frontend; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Nome, código textual, barcode opcional, unidade, preço, categoria, custo conhecido/desconhecido e ativo.

## Interações e retorno

Salvar/cancelar → T10; categorias → T12; fotos apenas quando extra E10 existir e estiver autorizado.

## Regras e aceite visual

Erros por campo e versão conflitante previstos. Não exigir Google nem tributos. Confirmação online do cadastro completo não bloqueia venda avulsa.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


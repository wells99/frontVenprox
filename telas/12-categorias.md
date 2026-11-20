FEITO - 20/11/2026 (simulação)

# T12 — Gerenciamento de categorias

**Tipo:** painel. **Estado:** implementada em memória. **Ordem:** 12. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Produtos/cadastro → Categorias. Saídas relacionadas: T10, T11. Referência: S02; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Lista, nome, criar/editar e inativar; opção sem categoria.

## Interações e retorno

Concluir → retornar origem T10 ou T11; inativar sem apagar produtos/histórico.

## Regras e aceite visual

Foco retorna ao botão de origem; seleção de categoria preservada ao voltar ao produto.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Painel acessível pela lista e pelo editor. Criação, renomeação, inativação/reativação, validação de nomes duplicados, carregamento e falha simulada. Renomear atualiza vínculos; inativar preserva produtos e seleção existente. Categorias inativas continuam consultáveis na lista e ficam fora de novas escolhas. Navegador confirmou criação, retorno de foco ao botão de origem e rascunho preservado. Build/lint aprovados. Sem persistência.

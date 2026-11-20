# T00 — Estrutura e navegação

Atualização em 20/11/2026: a estrutura agora monta T01 na seção Vendas. Os outros destinos seguem vazios; o histórico fica montado para preservar filtros/página ao trocar de seção. T00 continua sendo a base comum.

**Tipo:** estrutura. **Estado:** base implementada; conteúdo das seções ainda vazio. **Ordem:** 0. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Aplicação. Saídas relacionadas: Todas as páginas internas. Referência: S01–S07; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Barra lateral fixa, seleção, recolhimento e área central branca. Menu: Vendas, Clientes, Produtos, Estoque, Contas a Pagar, Caixa, Relatórios e Configurações.

## Interações e retorno

Selecionar seção por link hash; voltar/avançar do navegador; recolher/expandir; acesso por teclado.

## Regras e aceite visual

O centro permanece visualmente vazio nesta etapa. Uma seção ativa por vez; sem tabela, indicador online fictício ou saldo inventado.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Somente navegação e fundo claro estão em código; clicar nas oito áreas seleciona a seção sem carregar conteúdo de negócio. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


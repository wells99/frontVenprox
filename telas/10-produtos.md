FEITO - 20/11/2026 (simulação)

# T10 — Lista de produtos

**Tipo:** página. **Estado:** implementada em demonstração, sem persistência. **Ordem:** 10. **Data:** 20/11/2026.

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


## Entrega e continuidade — 20/11/2026

- `ProductsPage.tsx` abre pela barra lateral em `#/produtos`, com busca focada, categorias laterais, filtro de situação, ordenação por nome/preço/saldo e paginação de seis itens. Tabela mostra nome, código, categoria, preço, saldo/unidade e ativo/inativo; fotos não são requisito e não há conexão Google.
- Pesquisa por nome sem distinção de acentos/maiúsculas, código textual e barcode opcional. Categorias Todos e Sem categoria, com contagens que acompanham busca e situação. A busca/categoria/situação reinicia a primeira página; filtros, seleção e ordenação permanecem ao navegar para outra área e retornar, enquanto a página estiver aberta.
- Seleção destaca a linha e mostra barcode/custo em resumo abaixo da tabela. Custo ausente aparece como Não informado; zero explicitamente informado aparece como R$ 0,00. Saldo zero e negativo são consultáveis sem alertas ou bloqueios.
- Setas acima/abaixo e Home/End percorrem os botões de seleção na página atual com foco visível. F2 é contextual à T10 e apenas informa que edição ainda não está disponível; não modifica produto nem abre formulário fictício.
- Adicionar produto, Editar e Gerenciar categorias permanecem desabilitados e indicados como futuros, pois T11/T12 ainda não foram implementadas. A ligação de retorno à lista e o reaproveitamento de seus filtros deverão ser conectados nessas unidades. Não foram antecipados formulários de cadastro ou edição.
- `productDemo.ts` contém metadados fictícios (categoria, custo conhecido/desconhecido, barcode, unidade e ativo) e reaproveita nome/código/preço/saldo dos oito produtos do catálogo da T02. Dois exemplos adicionais permitem demonstrar produto sem categoria/custo zero e produto inativo. Esses dois exemplos não ampliam o catálogo de venda nesta etapa. A T11 deve centralizar a fonte editável compartilhada; não criar cópias independentes de preço/saldo.
- Cenários expansíveis de carregamento, falha de consulta e catálogo vazio. Falha permite nova tentativa com filtros preservados. Busca sem resultado permite limpar filtros e retomar consulta; catálogo vazio informa a etapa futura do cadastro e permite restaurar os exemplos.
- Validação: build/lint e dez testes existentes do caixa aprovados. Navegador: busca por cafe, REFRI e barcode de Biscoito, categorias, situação Inativos, ordenação por saldo, paginação, ausência de resultados, catálogo vazio/restauração, erro/nova tentativa, setas/Home/End, F2, recarga em Produtos e navegação Produtos → Caixa → Produtos preservando busca. Custos zero/desconhecido e saldo negativo conferidos; console sem erros.
- Layout inspecionado em 1366×768, 1920×1080 e 375×812. Sem rolagem horizontal da página; tabela rolável horizontalmente com região focável na tela estreita. Escala nativa do Windows não foi alterada. Prévia em `../artifacts/t10-produtos.jpg`.
- Limites: dados fictícios apenas em memória; sem persistência, cadastro, edição, gestão de categorias, integração de fotos ou baixa real de estoque. Próxima unidade: T11 — cadastro e edição de produto.

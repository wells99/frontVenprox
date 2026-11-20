FEITO - 20/11/2026 (simulação)

# T11 — Cadastro e edição de produto

**Tipo:** modal. **Estado:** implementada em memória. **Ordem:** 11. **Data:** 20/11/2026.

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


## Entrega e validação

Cadastro/edição com nome, código, barcode opcional, unidade, preço, categoria, custo opcional e ativo. Validação por campo, duplicidade de código/barcode, bloqueio de repetição e cenários de falha/conflito. Saldo inicial zero; edição preserva saldo. Build e lint aprovados; navegador validou campos obrigatórios, criação, busca e custo desconhecido. Sem persistência, fotos ou integrações.

Ajuste de interação em 20/11/2026: um clique em qualquer célula seleciona e foca o produto; ↑/↓ navegam pelos produtos visíveis, inclusive a partir da busca, sem circular nos extremos. Dois cliques na linha ou F2 abrem a edição do produto selecionado. Ao fechar, foco/seleção e filtros são preservados. Setas não interceptam os seletores nem os modais. Navegador validou clique simples, clique duplo, ↑/↓, F2, Esc e limite da lista; build e lint aprovados.

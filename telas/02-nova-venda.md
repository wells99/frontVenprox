FEITO - 20/11/2026

# T02 — Montagem da venda

**Tipo:** página. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 2. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Vendas → Nova Venda. Saídas relacionadas: T03, T06, T15. Referência: S08, S09; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Busca no alto, quantidade, resultados e itens no centro, resumo à direita, total e concluir no rodapé. Item avulso: descrição, quantidade e preço.

## Interações e retorno

Adicionar por clique ou Enter, inclusive código de barras; setas selecionam resultados e mantêm o selecionado visível. Alterar/remover item, cliente opcional, observação e desconto. F2 → T03; F3 foca desconto, F4 observação, F5 cliente e F12 quantidade. Sem caixa aberto, mostrar explicação e manter rascunho; a abertura completa T06 ainda não foi implementada.

## Regras e aceite visual

Modo permissivo aceita avulso/saldo negativo sem alerta; estrito exige produto/saldo. Preço do item não muda silenciosamente. Rascunho e retorno precisam de contrato futuro de persistência.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementação em `src/features/sales/NewSale.tsx`, regras de rascunho em `saleDraft.ts`, estilos em `checkout.css` e diálogo reutilizável em `DemoDialog.tsx`. Rota: `#/vendas/nova`, a partir do Histórico/F3. Nenhum banco, pagamento bancário, impressão ou serviço de sincronização foi integrado.

## Funcionamento simulado entregue

- Catálogo fictício com nome/código/barcode, preço e saldo fixos; pesquisa sem acentos/maiúsculas, clique, Enter e setas.
- Quantidade inteira de 1 a 999; adicionar novamente produto cadastrado acumula quantidade. Alterar quantidade e remover linha atualiza totais em centavos.
- Item avulso com descrição e preço positivo, usando a quantidade escolhida, sem cadastro/baixa fictícia de estoque.
- Padrão permissivo aceita produtos com saldo zero/negativo silenciosamente. O cenário “Exigir estoque disponível” bloqueia avulso e quantidades acima do saldo, inclusive ao concluir.
- Cliente opcional de demonstração, observação e desconto em reais, menor que o subtotal. A permissão de desconto é apenas cenário fictício, não autorização de backend.
- Rascunho mantido em memória ao voltar ao Histórico ou trocar de seção; descarte explícito pede confirmação. Recarregar/fechar a página perde o rascunho.
- “Caixa aberto (simulação)” começa marcado para exercitar T02/T03 sem antecipar T06. Se desmarcado, conclusão é bloqueada e explica a etapa de abertura; não existe sessão de caixa real.
- Concluir encaminha a `#/vendas/nova/pagamento`. Ao finalizar a simulação, um registro único com desconto, meios e observação entra no Histórico em memória, e o rascunho é limpo.

## Validação realizada

Em 20/11/2026: build e lint aprovados; testes em Edge conferiram quantidade/código/Enter, avulso inválido/válido, estoque obrigatório, quantidade acima do saldo, desconto inválido/válido, cliente/observação, rascunho, descarte, caixa fechado e ligação com T03. Validadas larguras 1366, 1920 e 375 px; tabela tem rolagem própria quando necessário. Verificações de centavos, quantidade e estoque agregado também passaram.

O catálogo/saldo é uma massa fixa de teste e não um estoque compartilhado atualizado pelas vendas. UUIDs/rascunho/dados de demonstração existem só na sessão. Integração real de persistência e regras de autorização continua para etapa própria. T04, T06 e T15 completas permanecem planejadas.


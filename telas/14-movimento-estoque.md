FEITO - 20/11/2026 (simulação)

# T14 — Entrada e ajuste de estoque

**Tipo:** modal. **Estado:** implementada em memória. **Ordem:** 14. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Estoque → Entrada/Ajuste. Saídas relacionadas: T13. Referência: S03 + guia de dados; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Produto, unidade, tipo, quantidade, custo quando conhecido e motivo.

## Interações e retorno

Confirmar → T13 atualizado pelo adaptador; cancelar sem gerar movimento.

## Regras e aceite visual

Ajuste absoluto gera diferença auditável; permissão/motivo e prevenção de repetição.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Modal conectado à T13 por ação geral ou por produto. Entrada soma quantidade positiva; ajuste absoluto define saldo final, permitindo zero/negativo e registrando a diferença. Prévia de antes/diferença/depois, motivo obrigatório, unidade, custo opcional (zero conhecido), permissão e falha simuladas, bloqueio imediato de repetição e identidade única por intenção. Validação recusa saldo desatualizado e mantém os campos em erro. Cancelar/Esc não gera movimento e restaura foco. Confirmação atualiza catálogo, saldo e histórico juntos em memória.

Custo informado substitui custo unitário cadastrado; omitir preserva o atual, sem custo médio ou valorização contábil. Histórico conserva nome/unidade/custo do lançamento. Permissões efetivas e persistência dependem do serviço futuro. A simulação atual registra entradas/ajustes manuais; vendas/cancelamentos ainda não geram movimentos automáticos de estoque. O catálogo atualizado já alimenta a busca de novas vendas; preços dos itens existentes no rascunho são preservados.

Build, lint e 14 testes de caixa/estoque aprovados. Navegador validou entrada −2 → 3 (+5), ajuste −2 → 0 (+2), motivo, permissão negada, cancelamento/Esc e retorno ao histórico. Conferidos 1366×768, 1920×1080 e largura 375, com tabelas roláveis na própria região. Escala real do Windows e equipamento da loja ainda precisam de validação presencial. Capturas em `../artifacts/t11-produto-editor.jpg` e `../artifacts/t14-movimento-estoque.jpg`.

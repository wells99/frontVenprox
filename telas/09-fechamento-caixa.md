FEITO - 20/11/2026 (simulação)

# T09 — Conferência e fechamento

**Tipo:** modal. **Estado:** implementada em demonstração, sem persistência. **Ordem:** 9. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Caixa → Fechar Caixa. Saídas relacionadas: T07. Referência: S06 + guia frontend; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Contagem física, esperado, diferença e conferência por meio; motivo de diferença quando aplicável.

## Interações e retorno

Confirmar → T07 com sessão fechada; voltar sem fechar.

## Regras e aceite visual

Distinguir fechado localmente de reconciliado online. Não recontar sessão antiga por cancelamento posterior.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e continuidade — 20/11/2026

- `CloseCashDialog.tsx` abre no botão Fechar caixa da T07. Mostra sessão/terminal/operador, dinheiro físico e demais meios separados, esperado, valor conferido e diferença por meio. Todos os valores começam vazios e exigem informação explícita, inclusive zero; não copiar automaticamente o esperado como contagem.
- Qualquer diferença exige motivo de até 300 caracteres. A diferença não gera ajuste financeiro nem altera os movimentos. Conferência manual não representa aprovação ou conciliação bancária.
- `validateCashClosing` e `closeDemoSession` em `cashDemo.ts` validam valores, sessão aberta no terminal, permissão simulada, motivo e instante de fechamento. Mudanças no livro durante a conferência exigem voltar e abrir novamente. Bloqueio imediato do formulário e sessão já encerrada impedem fechamento repetido.
- Fechamento guarda data, operador, esperado, conferido e motivo na sessão, marca envio pendente simulado e retorna à T07 em Caixas anteriores, selecionando a sessão encerrada. Os filtros da consulta são reiniciados após sucesso para que não escondam o caixa recém-fechado. Cancelar/Esc mantém o contexto, os filtros e a sessão aberta; foco retorna ao botão Fechar caixa. Tab fica no modal, com cabeçalho e ações visíveis e conteúdo rolável.
- A sessão encerrada não aceita vendas, suprimentos, sangrias ou reversões posteriores. Nova Venda exige nova abertura explícita; não há reabertura/edição administrativa nesta etapa.
- Cenários expansíveis: permissão de fechamento e falha de fechamento. Carregamento bloqueia confirmação e saída; falha mantém sessão aberta e campos preenchidos, permitindo nova tentativa.
- Validação: build, lint e dez testes do modelo aprovados. Navegador: campos vazios, motivo obrigatório, permissão negada, falha, nova tentativa disponível, cancelamento/Esc, ciclo de Tab, foco, fechamento e consulta. Conferido R$ 200 esperado / R$ 190 contado / diferença de −R$ 10, com motivo preservado na sessão #27; Nova Venda exigiu abertura e criou sessão #28 com zero informado. Console sem erros nessa validação.
- Layout inspecionado em 1366×768, 1920×1080 e 375×812, sem rolagem horizontal da página ou tabela; conteúdo rola verticalmente quando necessário. Escala nativa do Windows não foi alterada.
- Limites: dados apenas em memória; não há commit local, persistência, sincronização, autorização efetiva, impressão ou conciliação online. Recarregar apaga a simulação. Exemplos antigos sem registro detalhado de fechamento continuam identificados como fictícios. Próxima unidade: T10, lista de produtos.

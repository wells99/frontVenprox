FEITO - 20/11/2026

# T07 — Caixa atual e anteriores

**Tipo:** página. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 7. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Caixa. Saídas relacionadas: T06, T08, T09. Referência: S06; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Abas atual/anteriores, resumo, dinheiro esperado, meios digitais separados, movimentos e fechar caixa.

## Interações e retorno

Abrir → T06; suprimento/sangria → T08; fechar → T09; consultar sessão anterior em aba.

## Regras e aceite visual

Pix/cartão não contam como dinheiro físico. Fiado recebido com caixa aparece separado de vendas; lembretes não entram no saldo.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Funcionamento simulado entregue

- O destino Caixa da barra lateral agora contém T07. Abas Caixa atual (`#/caixa`) e Caixas anteriores (`#/caixa/anteriores[/numero]`) têm seleção ativa, controles ARIA e navegação por setas/Home/End. Entrar na seção move o foco para o título.
- Sem sessão, mostra estado vazio com Abrir caixa → T06 e consulta dos anteriores. Com sessão aberta, apresenta número, terminal, operador, data/hora e envio explicitamente simulado. Recarregar mantém apenas a rota; a sessão e vendas de demonstração são descartadas.
- Dinheiro esperado na gaveta tem destaque separado dos recebimentos digitais líquidos. Usa valor inicial + entradas líquidas em dinheiro + suprimentos − sangrias; Pix/crédito/débito nunca entram no dinheiro físico. Pagamentos usam o valor aplicado, já descontado o troco, sem somar o dinheiro entregue pelo cliente como receita adicional.
- Resumo apresenta abertura, vendas, cancelamentos, vendas líquidas, recebimentos de fiado, suprimentos e sangrias. A lista de meios detalha vendas líquidas e recebimentos por dinheiro/crédito/débito/Pix. Fiado recebido fica separado do faturamento; lembretes não aparecem como saída financeira.
- Movimentos têm descrição, horário, operador e valores por meio. Filtros de tipo/meio alteram apenas a lista, preservando o resumo integral da sessão; há estado sem resultados e ação de limpar. Movimentos do mesmo minuto usam o instante completo do registro para ordenar corretamente.
- Duas sessões anteriores (#25/#26) são dados fictícios fixos com abertura, vendas, cancelamentos, recebimentos de fiado e exemplos de suprimento/sangria. Consulta inclui busca por número/operador/terminal, data de abertura, seleção destacada, dinheiro esperado/contado e diferença registrada. O caixa #25 demonstra diferença de −R$ 1,00.
- Vendas concluídas pela T03 atualizam atomicamente o Histórico e os movimentos da sessão aberta em memória. Repetir a mesma conclusão não duplica o movimento. Cancelamento T05 da própria sessão aberta acrescenta uma reversão vinculada única, preservando a venda original no livro e atualizando os saldos.
- Sessões encerradas mantêm seus movimentos/valores originais. Cancelar depois uma venda de sessão encerrada altera somente sua situação no Histórico; a restituição em uma sessão atual ainda exige comando/contrato futuro e não é simulada automaticamente. Nenhum valor é lançado em sessão inexistente ou fechada.
- Suprimento, Sangria e Fechar caixa aparecem desabilitados com indicação “em breve” e explicação. T08/T09 continuam planejadas; consultar os movimentos fixos dos caixas anteriores não oferece um cadastro/fechamento fictício dessas unidades.
- Cenários de demonstração: carregamento, falha de consulta com retentativa e consulta vazia nos anteriores. Falha não remove dados/filtros ou encerra a sessão.
- Implementação em `src/features/cash/CashPage.tsx`, `cashDemo.ts` e `cash.css`. Estado conjunto de vendas/sessões em `App.tsx`; T02 recebe a sessão compartilhada e o filtro Caixa da T01 inclui números de novas sessões.

## Validação e limites

Em 20/11/2026: `npm.cmd run build`, `npm.cmd run lint` e `npm.cmd test` aprovados. Os testes de `tests/cash.test.mjs` cobrem abertura válida/zero, bloqueio de sessão duplicada, pagamentos mistos/troco, reversão única, sessão fechada/inexistente, separação de fiado/suprimento/sangria e instante completo de venda.

No navegador interno: conferidos abertura a partir de T07/T02, navegação entre abas, busca sem resultados/restauração, seleção de sessão anterior, filtros de movimentos, leitura de fiado separado, falha/retentativa de consulta, venda com dinheiro + Pix/troco entrando na sessão #27 e cancelamento da mesma venda revertendo os saldos sem duplicar movimentos. Recarregar confirmou o limite de memória.

Layout conferido em 1366×768, 1920×1080, 375×812 e área útil aproximada de 1093×614, sem rolagem horizontal da página. A escala real do Windows precisa ser validada no equipamento. Não há caixa físico, conferência bancária, fechamento efetivo, persistência, envio ou integração com fiado real. Os registros anteriores e suas contagens são apenas exemplos de consulta; T08, T09 e T17/T18 não foram antecipadas.

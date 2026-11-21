FEITO - 20/11/2026 (simulação)

# T19 — Agenda de contas a pagar

**Tipo:** página. **Estado:** implementada em memória. **Ordem:** 19. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Barra lateral → Contas a Pagar. Saídas relacionadas: T20. Referência: S05 + simplificação confirmada; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Próximas, vencidas e resolvidas; descrição, valor informativo, data/hora e recorrência.

## Interações e retorno

Criar/editar/adiar → T20; resolver ocorrência; interromper série.

## Regras e aceite visual

Agenda não cria despesa nem saída de caixa. Toast no horário não rouba foco; atraso recuperado ao reabrir sem rajada.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Agenda com próximas/vencidas/resolvidas, busca, paginação, seleção por clique/setas, resolução de ocorrência e interrupção de série preservando histórico. Uma ocorrência pendente por série; resolver gera a próxima data ancorada, inclusive se ainda estiver vencida. Toast transversal agrupa atrasadas, deduplica por ocorrência/data e não rouba foco; fica suspenso durante a montagem/pagamento e entrega após modais. Consulta possui estados vazio, carregamento e falha. Build/lint aprovados; navegador validou aviso, acesso à vencida e resolução com próxima ocorrência mensal. Cadastro, edição e adiamento estão conectados à T20, com retorno de foco e revelação da ocorrência criada/adiada. Dados e avisos apenas em memória; não há baixa financeira, persistência ou notificação com processo encerrado.

Conferência final T19/T20: avisos agrupados não roubam foco e ficam suspensos na montagem/pagamento. Próximas, vencidas e resolvidas compartilham o mesmo estado da agenda, sem efeito financeiro. Build/lint e 31 testes aprovados; capturas e limites registrados na T20.

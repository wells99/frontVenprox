FEITO - 20/11/2026 (simulação)

# T20 — Cadastro de lembrete

**Tipo:** modal. **Estado:** implementada em memória. **Ordem:** 20. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Contas a Pagar → Nova conta/Editar. Saídas relacionadas: T19. Referência: Orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Descrição, valor, data, hora, recorrente e frequência/intervalo quando aplicável.

## Interações e retorno

Salvar/cancelar → T19; edição diferencia ocorrência atual e futuras quando recorrente.

## Regras e aceite visual

Persistir regra/ocorrência local e remotamente quando implementado; mês curto não desloca definitivamente o dia-âncora. Detalhes em P14.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Modal conectado à T19 para criar, editar e adiar lembretes. Descrição, valor informativo (zero explícito permitido), data/hora de Brasília, recorrência e frequência/intervalo. Frequências propostas em P14: diária, semanal, mensal e anual, com intervalo inteiro de 1 a 365. Datas da demonstração entre 2000 e 2099. Prévia de vencimento e próxima data da série; corpo rolável e ações sempre visíveis.

Editar série recorrente diferencia somente esta ocorrência de esta e as futuras. Alterar descrição/valor das futuras sem alterar calendário conserva o dia original; mudar a data/regra para futuras estabelece nova referência. Ocorrências resolvidas permanecem intactas. Adiar muda apenas o vencimento atual e preserva identidade e data original. Série interrompida permite editar a ocorrência sem retomar geração. Uma pendente por série; resolver gera a próxima data, mesmo quando ainda vencida, sem descartar atrasos.

Validação por campo, versão conflitante/falha simuladas com campos preservados, estado de salvamento e bloqueio imediato de repetição. Salvar retorna à agenda; nova conta/adiamento revela a ocorrência na situação correspondente. Cancelar/Esc devolvem foco e preservam filtros. Seleção por setas, F2 e dois cliques na lista abre a edição.

Verificação concluída em 20/11/2026: build, lint e 31 testes aprovados. Testes cobrem calendário mensal/anual com dia 31 e ano bissexto, intervalos, edição atual/futura, adiamento, preservação de resolvidas, interrupção, deduplicação, versões e avisos agrupados. Navegador validou cadastro, erros por campo, falha/nova tentativa, valor zero, edição futura, adiamento, resolução, interrupção e teclado. Revisados 1366×768, 1920×1080 e largura 375; conferida a versão compilada sem erros de aplicação. Capturas em `../artifacts/t19-contas-a-pagar.jpg` e `../artifacts/t20-lembrete-editor.jpg`. Escala física do Windows e equipamento da loja ainda precisam de validação presencial.

## Limitações da demonstração

Regra e ocorrências existem apenas em memória; recarregar restaura os exemplos. Persistência local/remota e sincronização dependem dos adaptadores futuros. Avisos são verificados a cada 10 segundos enquanto a aplicação está aberta, agrupados e deduplicados por ocorrência/data; suspendem entrega durante modais e montagem/pagamento. Retomar a janela confere atrasos sem rajada. Não há aviso com processo encerrado. A agenda não executa pagamento bancário, cria despesa, movimenta caixa, altera venda/fiado ou estoque.

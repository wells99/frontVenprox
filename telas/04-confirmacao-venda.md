FEITO - 20/11/2026

# T04 — Confirmação da venda

**Tipo:** modal. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 4. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Pagamento → sucesso confirmado. Saídas relacionadas: T01, T02. Referência: S10; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Valor, número legível, mensagem Venda feita, iniciar nova venda e fechamento; impressão manual quando disponível.

## Interações e retorno

Iniciar Nova Venda → T02 vazio; fechar → T01; imprimir/reimprimir a mesma venda.

## Regras e aceite visual

Erro de envio ou impressão não volta ao pagamento; distinguir salva localmente/pendente. Protótipo nunca se apresenta como comprovante de gravação real.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.

## Funcionamento simulado entregue

- T03 conclui a tentativa com seu atraso visual e, apenas no sucesso, adiciona uma venda única ao Histórico e abre T04. Falha na conclusão permanece em T03, mantendo rascunho e pagamentos.
- Rota: `#/vendas/nova/confirmacao/<id-da-venda>`. O pagamento é substituído na navegação para não reaparecer como etapa pendente ao voltar. A confirmação usa o registro já incluído no Histórico, preservando número, total com desconto, data/hora, meio e troco, mesmo com o rascunho já limpo.
- Modal mostra “Venda feita!”, valor, número legível, meio informado, troco e aviso explícito de demonstração. “Envio pendente (simulado)” não significa gravação local: a mensagem esclarece que a venda existe somente na memória, sem banco ou servidor.
- “Iniciar Nova Venda” abre T02 vazia, com busca focada, sem itens, cliente, observação ou desconto da venda anterior. “Voltar ao histórico”, X e Escape levam a T01, sem cancelar ou criar outro registro; a busca do Histórico recebe foco.
- Foco inicial na ação de nova venda. Tab/Shift+Tab circulam dentro do diálogo compartilhado; Enter repetido não aciona nova venda enquanto a tecla usada para concluir o pagamento continua pressionada. F2 da montagem/pagamento não atua por trás de T04.
- Impressão automática desligada. A ação manual “Simular impressão” tem carregamento, sucesso e “Simular reimpressão” para a mesma venda; não abre a impressora nem emite papel/comprovante. Nos cenários, é possível deixar a impressora indisponível e provocar falha de impressão. A falha mantém a conclusão e permite tentar de novo sem repetir pagamento.
- “Simular envio”, nos cenários de demonstração, permite falha e retentativa. A venda continua concluída e pendente durante a falha; sucesso muda apenas o envio fictício da mesma venda para Recebida, também no Histórico. Não há tráfego para servidor. Sair do modal cancela os temporizadores pendentes.
- Rota inexistente, sem identificador ou recarregada sem a venda em memória mostra “Confirmação indisponível”, orientando consultar o Histórico, sem apresentar falso sucesso.
- Implementação em `src/features/sales/SaleConfirmation.tsx` e `confirmation.css`, conectada por `NewSale.tsx`/`App.tsx`. Reutiliza `DemoDialog`, a paleta global e o catálogo de ícones; T05 foi conectada na etapa seguinte; as demais unidades continuam planejadas. A contagem de impressões simuladas agora pertence à venda e é compartilhada com o detalhe T05.

## Validação realizada

Em 20/11/2026: build TypeScript/Vite e lint aprovados. No Edge, validado o fluxo T02 → T03 → T04, falha/retentativa de pagamento, confirmação única com F2 repetido, pagamento misto, desconto, troco, cliente/observação preservados no registro, impressão/reimpressão simuladas e falhas de impressão/envio com retentativa sem duplicar a venda. Conferidos nova venda vazia, saídas por Escape/X/botão, foco inicial e ciclo de Tab, atualização do envio no Histórico e proteção de rota após recarregar.

Conferidas larguras 1366×768, 1920×1080, 375×812 e área útil de 1093×614 (aproximação do espaço disponível a 125% de escala), sem rolagem horizontal no diálogo. A escala real do Windows/equipamento do balcão continua pendente de validação. Dados exclusivamente em memória; recarregar apaga as vendas simuladas.


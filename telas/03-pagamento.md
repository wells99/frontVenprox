FEITO - 20/11/2026

# T03 — Conferência de pagamento

**Tipo:** modal. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 3. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Nova Venda → Concluir/F2. Saídas relacionadas: T02, T04. Referência: S09; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Total destacado, dinheiro/crédito/débito/Pix manuais, dinheiro recebido/troco e divisão entre meios.

## Interações e retorno

Voltar/Escape → T02 preservando itens, cliente, desconto e observação; valores de pagamento são reiniciados ao reabrir a conferência. Confirmar → estado de conclusão simulada; sucesso adiciona um único registro no Histórico e retorna a T01. Esse retorno é provisório até implementar T04; o adaptador real e o commit local ainda não existem.

## Regras e aceite visual

Cobertura exata do total; troco apenas no dinheiro. Soltar F2 antes de novo acionamento. Não indicar aprovação bancária nem oferecer fiado automático.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementação em `src/features/sales/PaymentDialog.tsx`, com `DemoDialog.tsx`, regras de centavos em `saleDraft.ts` e estilos em `checkout.css`. Rota: `#/vendas/nova/pagamento`; entrar diretamente sem rascunho válido mostra orientação para voltar à montagem, sem permitir venda de total zero.

## Funcionamento simulado entregue

- Dinheiro, crédito, débito e Pix informados manualmente. Clicar no nome de um meio preenche o total nele e limpa os demais; também é possível distribuir os valores e usar “+ restante”.
- Dinheiro começa preenchido com o total; exibir valor informado, restante e troco em dinheiro. Desconto da montagem já está aplicado ao total.
- Ao abrir, o campo Dinheiro recebe foco com o valor selecionado. ↑/↓ navegam na ordem Dinheiro → Crédito → Débito → Pix; nos extremos, permanecem na primeira/última opção. Com apenas um meio preenchido, transferem o total da venda para o destino e limpam os demais. O valor no destino fica selecionado para substituição imediata; dinheiro recebido acima do total não é transferido como excesso para cartão/Pix.
- Se dois ou mais meios já têm valores positivos, ↑/↓ apenas movem o foco, preservando a divisão e o troco. Tab continua disponível para editar e distribuir valores. Clicar no nome do meio volta a concentrar o total nele e posiciona o foco no campo correspondente. A dica do modal acompanha o modo único/dividido.
- Validar valores não negativos com até duas casas decimais, insuficiência e excesso digital. Troco só é calculado a partir de dinheiro; não devolver excesso de Pix/cartão como dinheiro.
- Exemplo validado: total R$ 7,25, Pix R$ 2,00 e dinheiro entregue R$ 10,00 → aplicado em dinheiro R$ 5,25 e troco R$ 4,75; soma aplicada R$ 7,25.
- Botão/Enter/F2 concluem simulação com atraso visual; repetir tecla segurada ou confirmar duas vezes não duplica o registro. Durante a conclusão, formulário e fechamento são bloqueados; sair pela navegação do navegador desmonta/cancela a tentativa pendente.
- Cenário de falha mantém valores e rascunho, sem adicionar venda; desmarcar a falha permite tentar novamente. Resultado bem-sucedido entra no Histórico com meio único ou Misto, desconto, observação e envio explicitamente fictício.
- Diálogo nativo mantém foco dentro dele; Escape/voltar restauram a montagem. Sem fiado automático, impressão ou aprovação bancária.

## Validação realizada

Em 20/11/2026: build/lint aprovados e fluxo Edge validou os quatro meios individuais, pagamento misto, troco, valor insuficiente, excesso digital, completar restante, voltar mantendo rascunho, falha/retentativa e confirmação única. F2 de abertura/repetido não conclui automaticamente. Registro final conferido no Histórico/prévia com desconto, meios, troco e observação. Conferidas larguras 1366, 1920 e 375 px sem rolagem horizontal do diálogo e sem erros de página.

“Concluir simulação” altera somente memória do frontend; não comprova gravação, recebimento, saldo de caixa/estoque ou sincronização reais. T04 (confirmação visual completa) é a próxima unidade, ainda não marcada como feita.

### Ajuste de teclado e componentes compartilhados — 20/11/2026

Validado no Edge: foco/seleção inicial, ↑/↓ nos quatro meios e nos extremos, transferência do total sem levar excesso de dinheiro, preservação da divisão ao usar setas/Tab, seleção por clique e conclusão por F2 repetido gerando apenas um registro. Conferidas larguras 1366, 1920 e 375 px, sem estouro horizontal nem erros de página. Build e lint aprovados.

Ícones de pagamento vêm de `src/ui/AppIcon.tsx` (`PaymentIcon`), também usado pelo Histórico. A paleta vem de `src/theme.css`; futuras telas devem reutilizar esses pontos, conforme o roteiro.


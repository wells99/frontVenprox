FEITO - 20/11/2026

# T05 — Detalhe, cancelamento e comprovante

**Tipo:** painel. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 5. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Histórico → Abrir/F2. Saídas relacionadas: T01. Referência: S01 + guia frontend; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Número, itens/snapshots, meios, total, operador, sessão, envio e situação; ações de cancelamento/reimpressão.

## Interações e retorno

Fechar → T01; cancelar exige motivo/permissão; imprimir não cria nova venda.

## Regras e aceite visual

Cancelada continua consultável; dupla reversão impedida no contrato. Devolução parcial só entra após escopo confirmado.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Funcionamento simulado entregue

- Histórico → Abrir, duplo clique na linha ou F2 abre o painel lateral em `#/vendas/<id>`, sem novo destino no menu. Botão de retorno, X e Escape fecham o detalhe; filtros, ordenação, página e seleção são mantidos. O foco volta ao botão da venda; se ela sair do filtro após o cancelamento, volta à busca.
- Mostra número, data/hora, situação, descrições/quantidades/preços originais, subtotal, desconto, total, meios e valores aplicados, dinheiro recebido/troco, cliente, operador, sessão de caixa, observação e envio fictício. Os itens são consultados do registro da venda, sem buscar preços atuais no catálogo.
- Cancelamento é uma ação separada e exige motivo não vazio (até 300 caracteres) e permissão explícita no cenário de demonstração. A confirmação inclui carregamento e bloqueio de repetição; a função `cancelDemoSale` também verifica motivo/permissão/situação antes de atualizar o registro. Falha simulada mantém venda e motivo para retentativa.
- Sucesso preserva itens, pagamentos e total originais, registra motivo, responsável fictício e data/hora, altera a situação para Cancelada e o envio para Pendente. O Histórico recalcula o total apenas das concluídas. A venda continua consultável e um segundo cancelamento fica bloqueado tanto no botão quanto na função de alteração.
- “Ver comprovante” abre uma prévia no próprio painel: loja de demonstração, identificação não fiscal, número/data, itens, quantidades, preços, subtotal/desconto/total, meios, recebido/troco e observação. Venda cancelada recebe indicação textual e motivo. Voltar ou Escape retorna ao detalhe e restaura o foco no botão do comprovante.
- Impressão automática continua desligada. “Simular impressão/reimpressão” tem estados de espera, falha e sucesso, sem papel ou nova venda. A contagem de impressões bem-sucedidas pertence ao registro em memória e é compartilhada entre T04 e T05; reabrir o painel mantém a opção de reimpressão. Impressora indisponível bloqueia a ação com explicação.
- Cenários do próprio painel permitem consulta em carregamento, erro com retentativa e venda não encontrada, permissão negada, falha de cancelamento e falha/indisponibilidade de impressão. Endereço sem registro também apresenta venda não encontrada. Sair do painel limpa os temporizadores pendentes.
- Foco inicial no retorno ao Histórico; Tab/Shift+Tab ficam no diálogo. O motivo recebe foco ao abrir a confirmação de cancelamento; Escape/Manter venda retorna ao detalhe sem alterar a venda. Atalhos F2/F3 do Histórico não atuam por trás do painel.
- Implementação em `src/features/sales/SaleDetail.tsx` e `detail.css`, conectada por `SalesHistory.tsx`/`App.tsx`. Usa o diálogo compartilhado, a paleta global e o catálogo de ícones. T06/T07 foram conectadas na etapa seguinte; T08 em diante continuam planejadas.

## Validação realizada

Em 20/11/2026: build TypeScript/Vite e lint aprovados. Navegador interno validou abertura por botão/F2, foco inicial, ciclo de Tab/Shift+Tab, motivo obrigatório, permissão negada, falha/retentativa e sucesso de cancelamento, bloqueio de segundo cancelamento, consulta posterior e atualização do total do Histórico. Teste direto do contrato conferiu também imutabilidade, preservação dos itens/valores, limite do motivo e recusa de reversão duplicada.

Conferidos consulta com erro/carregamento/vazia e recuperação, comprovante de venda concluída/cancelada, impressão com falha/retentativa e indisponibilidade, retorno por Escape e preservação de busca/ordenação/página/foco. Fluxo T02 → T03 → T04 → Histórico → T05 validado com desconto, observação, dinheiro + Pix, troco e impressão na T04 reconhecida como reimpressão na T05, sem duplicar o registro.

Conferidos 1366×768, 1920×1080, 375×812 e área útil de aproximadamente 1093×614, sem rolagem horizontal no painel/conteúdo. A escala real do Windows e a impressora do balcão ainda precisam ser validadas no equipamento.

## Limitações para continuidade

Tudo permanece apenas em memória e se perde ao recarregar. Permissão é um controle de cenário, sem autenticação ou autorização efetiva. Cancelar não gera estorno financeiro, movimento de estoque/caixa ou sincronização real; esses contratos devem ser garantidos atomicamente e com idempotência pelo serviço futuro. Impressão/reimpressão não aciona driver nem impressora. A identificação da loja no comprovante é fictícia. Na etapa T06/T07, cancelar uma venda da própria sessão ainda aberta passou a registrar reversão única no livro simulado. Vendas de sessões encerradas não recalculam seus valores; a restituição posterior depende de comando futuro. Não foram implementados devolução parcial, emissão fiscal, T08/T09 ou outros módulos.

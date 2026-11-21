FEITO - 20/11/2026 (simulação)

# T18 — Ajuste e quitação de fiado

**Tipo:** modal. **Estado:** implementada em memória. **Ordem:** 18. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Fiado → Aumentar/Diminuir/Quitar. Saídas relacionadas: T17, T06. Referência: Orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Tipo (correção/recebimento), valor, motivo, quitação total/parcial; no recebimento, meio e Registrar no caixa inicialmente desmarcado.

## Interações e retorno

Prévia do saldo e efeito no caixa; salvar → T17; com caixa fechado orientar T06 sem perder contexto.

## Regras e aceite visual

Não reduzir além da dívida; opção sem caixa não gera movimento; sessão exigida quando marcada. Reversão identificada.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Modal para aumentar/diminuir por correção, receber parcialmente ou quitar o total. Valor em centavos, motivo obrigatório, meio informado manualmente e Registrar no caixa desmarcado inicialmente. Prévia de dívida e efeito no caixa. Ajustes/recebimentos sem caixa funcionam com sessão fechada; quando marcado, a abertura T06 é explícita, retorna ao mesmo modal e preserva valor/motivo/meio. Cancelar a abertura também preserva o lançamento. Salvar é bloqueado durante processamento; falha/permissão negada preservam os campos e não alteram dívida/caixa.

Reversão integral com motivo/permissão simulada, vínculo ao original e indicação nos dois lançamentos. Não permite reversão repetida nem dívida negativa. Recebimento antes registrado no caixa exige compensação na sessão atual aberta, preservando sessões encerradas. Reversão de lançamento sem caixa permanece sem caixa. Resumos e recebimentos por meio incluem as reversões, mantendo fiado separado de vendas e dinheiro separado dos digitais.

Comandos validam saldo e último lançamento, recusam valor acima da dívida, precisão inválida e intenção repetida. Histórico, dívida e movimento opcional no caixa são atualizados juntos no estado em memória; vendas/estoque são preservados. Nada é gravado ou enviado a servidor. Identidade e nome do cliente ficam registrados na venda sem criar dívida automática. Permissões efetivas, persistência, sincronização e recebimentos reais dependem do serviço futuro.

Build, lint e 22 testes de caixa/estoque/clientes/fiado aprovados. Navegador validou cadastro mínimo/homônimos, seleção na venda preservando itens, recebimento sem caixa, recebimento Pix com abertura explícita, compensação no caixa, quitação, redução excessiva, permissão negada, falha/nova tentativa, cancelamento, teclado e foco. Conferidos 1366×768, 1920×1080 e largura 375; T18 mantém ações visíveis com corpo rolável. Aba nova sem erros de aplicação. Escala física do Windows e equipamento da loja ainda precisam de validação presencial. Capturas em `../artifacts/t15-clientes.jpg`, `t16-cliente-editor.jpg`, `t17-fiado.jpg` e `t18-fiado-lancamento.jpg`.

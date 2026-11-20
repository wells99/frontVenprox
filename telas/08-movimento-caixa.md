FEITO - 20/11/2026 (simulação)

# T08 — Suprimento e sangria

**Tipo:** modal. **Estado:** implementada em demonstração, sem persistência. **Ordem:** 8. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Caixa → Adicionar/Remover valores. Saídas relacionadas: T07. Referência: S06; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Tipo, valor, motivo, operador e sessão atual.

## Interações e retorno

Confirmar movimento autorizado e retornar T07; cancelar sem alteração.

## Regras e aceite visual

Valor positivo; tipo determina sinal; sessão aberta exigida; impedir confirmação repetida.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e continuidade — 20/11/2026

- Modal `CashMovementDialog.tsx`, aberto pelos botões Adicionar dinheiro · Suprimento e Remover valores · Sangria da T07. Tipo selecionável, valor positivo em centavos, motivo obrigatório (até 300 caracteres), operador e sessão identificados; prévia do dinheiro esperado após o lançamento.
- `registerCashMovement` e `validateCashMovement` em `cashDemo.ts` verificam sessão aberta no terminal, valor, tipo, motivo e autorização simulada. Identidade por intenção e bloqueio imediato no formulário impedem confirmação repetida. Vendas, meios digitais e sessões encerradas são preservados.
- Confirmação atualiza resumo e linha de movimentos em memória, mostra retorno de sucesso e restaura foco ao botão de origem. Cancelar/Esc não alteram valores. O modal mantém o contexto e os filtros da T07; Tab permanece no diálogo.
- Cenários expansíveis de permissão negada e falha de registro. Carregamento bloqueia confirmação e fechamento; falha mantém os campos para nova tentativa. Não há autorização real ou serviço de gravação.
- Sangria superior ao dinheiro esperado mostra prévia negativa e orientação para conferir os movimentos; não foi acrescentada regra de bloqueio por saldo, ausente nesta especificação. Validar essa política ao implementar o serviço.
- Verificação: build e lint aprovados; oito testes do modelo de caixa aprovados. Navegador: campos vazios, motivo obrigatório, permissão, falha/nova tentativa, suprimento, sangria, cancelamento, Esc, ciclo de Tab e restauração de foco. R$ 200 + R$ 50 − R$ 30 = R$ 220, sem modificar recebimentos digitais. Layout conferido em 1366×768, 1920×1080 e 375×812, sem rolagem horizontal; modal rola verticalmente quando necessário. Escala nativa do Windows não foi alterada.
- Dados apenas em memória: recarregar descarta lançamentos. Sem persistência, sincronização, impressão ou permissões efetivas. Próxima unidade: T09, conferência e fechamento; seu botão permanece indisponível.

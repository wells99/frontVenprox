FEITO - 20/11/2026

# T06 — Abertura de caixa

**Tipo:** modal. **Estado:** implementada e validada como frontend de demonstração. **Ordem:** 6. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Caixa fechado ou Nova Venda sem sessão. Saídas relacionadas: T02, T07. Referência: S06 + orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Valor existente na gaveta, identificação de terminal/operador; zero precisa ser informado explicitamente.

## Interações e retorno

Abrir → retomar origem T02 ou T07; cancelar não inicia venda nem abre sessão oculta.

## Regras e aceite visual

Uma sessão por terminal; erros mantêm valor; acesso por teclado; abertura real depende de serviço futuro.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Funcionamento simulado entregue

- A demonstração começa sem sessão aberta no terminal Balcão 01. T07 → Abrir caixa usa `#/caixa/abertura`; Histórico → Nova Venda/F3 abre T06 antes da montagem quando não há sessão, com retorno à origem.
- Identificação fictícia de terminal/operador e campo de dinheiro inicial vazio. Exige preenchimento explícito; aceita zero, vírgula ou ponto e até duas casas decimais, sem milhar. Campo vazio, negativo ou malformado mantém o foco e apresenta mensagem específica.
- Confirmar simula espera e cria uma sessão em memória, com número único e movimento de abertura. Um bloqueio imediato impede confirmação duplicada; `openDemoSession` também recusa uma segunda sessão aberta no mesmo terminal. A sequência inicial passa dos caixas históricos #25/#26 para #27.
- Sucesso retorna à montagem com busca focada ou à página Caixa com título focado, conforme origem. A venda passa a usar a sessão aberta, em vez do antigo número fixo #26. A opção de cenário “Caixa aberto” da T02 foi substituída por este fluxo compartilhado.
- Cancelar, X e Escape não criam sessão ou venda: voltam ao Histórico/ação Nova Venda ou ao botão Abrir caixa da T07. Rascunhos existentes permanecem em memória. Tab/Shift+Tab ficam no modal; atalhos do Histórico/montagem não operam por trás da abertura.
- O cenário de falha de abertura não cria sessão e mantém o valor para corrigir ou tentar novamente. O modal bloqueia ações enquanto simula a abertura e limpa o temporizador ao desmontar.
- Implementação em `src/features/cash/OpenCashDialog.tsx`, `cashDemo.ts` e `cash.css`, com estado compartilhado em `App.tsx`.

## Validação e limites

Em 20/11/2026: build, lint e testes automatizados aprovados. Navegador interno validou entradas pelas duas origens, vazio/negativo, zero explícito, abertura com R$ 200,00, falha mantendo valor, cancelamento sem sessão oculta, foco inicial/retorno, ciclo de Tab/Shift+Tab e retomada da venda com a sessão correta.

Conferidos 1366×768, 1920×1080, 375×812 e área útil aproximada de 1093×614, sem rolagem horizontal no modal. A escala real do Windows/equipamento continua pendente. A sessão não é persistida e some ao recarregar; não há autenticação, permissão efetiva, banco, abertura física de gaveta ou envio real. T08/T09 não foram implementadas.

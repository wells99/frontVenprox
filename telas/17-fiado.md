FEITO - 20/11/2026 (simulação)

# T17 — Fiado manual do cliente

**Tipo:** página. **Estado:** implementada em memória. **Ordem:** 17. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Clientes → cliente → Fiado. Saídas relacionadas: T18, T15. Referência: Orientação do responsável; sem captura própria; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Nome, dívida atual e histórico; aumentar, diminuir e quitar. Complemento sem vínculo automático à venda.

## Interações e retorno

Lançar/ajustar/quitar → T18; voltar → T15.

## Regras e aceite visual

Recebimento não cria nova venda/faturamento/estoque; salvar e sincronizar histórico mesmo quando não registra no caixa.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Página interna em Clientes, sem item extra na barra. Nome, contato, situação, dívida calculada pelo histórico, autor/data, tipo/motivo, valores anterior/posterior e efeito no caixa. Dados iniciais fictícios possuem lançamentos explícitos. Edição do cliente preserva identidade e histórico; retorno à lista mantém filtros. Estados de consulta vazia, erro e carregamento simulados. Build/lint aprovados; navegador confirmou dívida de R$ 60,00 a partir de R$ 80,00 menos recebimento de R$ 20,00 sem caixa. Comandos e reversões são conectados na T18. Histórico e envio apenas simulados em memória.

Conexão final T18: ações Aumentar, Diminuir e Quitar e reversão de lançamentos com vínculo ao original. Ao zerar dívida, Diminuir/Quitar ficam desabilitados. Recebimentos/reversões com caixa aparecem separados de vendas na sessão compartilhada. Histórico/valores são preservados ao editar ou inativar o cliente.

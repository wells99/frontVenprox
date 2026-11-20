# T05 — Detalhe, cancelamento e comprovante

**Tipo:** painel. **Estado:** especificada, não implementada. **Ordem:** 5. **Data:** 20/11/2026.

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


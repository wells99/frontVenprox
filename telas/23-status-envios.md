FEITO - 20/11/2026 (simulação)

# T23 — Status de envio e suporte

**Tipo:** página. **Estado:** implementada em simulação. **Ordem:** 23. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Configurações → Envios; indicador contextual futuro. Saídas relacionadas: T22. Referência: Guia frontend seção 7; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Último sucesso, contagem/idade das pendências, conflitos e detalhes para suporte.

## Interações e retorno

Voltar → T22 ou origem; ação contextual de rever conflito; reautenticação quando necessária.

## Regras e aceite visual

Sem rede não é fila vazia. Evitar expor outbox/cursor/schema à operadora; nunca apagar fila como correção. Sem backend, não inventar online ou sincronizado.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Implementação e continuidade

Página interna `/configuracoes/envios`, com retorno à seção Envio e dados da T22 e foco na ação de origem. Consulta em memória com estados de carregamento/erro, exemplos de conexão ausente, envio, conflito, autorização expirada, bloqueio, vazio e leitura indisponível. A contagem abrange somente vendas marcadas na sessão; não representa a fila completa. Falha de leitura exibe quantidade desconhecida. Revisão de conflito e tentativa de renovação são simulações explícitas e não alteram cadastro, autorização ou pendências. Detalhes de suporte selecionáveis não contêm clientes ou credenciais.

Build/lint e três testes do modelo aprovados; revisão, falha, vazio, leitura desconhecida e Escape conferidos no navegador. Testes e capturas preservados. Serviços de envio/autenticação e persistência continuam ausentes.

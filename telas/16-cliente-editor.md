FEITO - 20/11/2026 (simulação)

# T16 — Cadastro mínimo de cliente

**Tipo:** modal. **Estado:** implementada em memória. **Ordem:** 16. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Clientes → Adicionar/Editar. Saídas relacionadas: T15, T17. Referência: S04 + orientação do responsável; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Nome e contato opcional; demais dados somente conforme finalidade; ativo.

## Interações e retorno

Salvar/cancelar → T15 ou origem no fiado/venda.

## Regras e aceite visual

Nome não é chave única. Não exigir documento; futuro UUID local permite cliente para fiado offline.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Modal de cadastro/edição com nome obrigatório, contato opcional e ativo. Identidade estável por UUID, nomes repetidos permitidos, versão validada e cenários de falha/conflito sem perder campos. Bloqueio de repetição durante salvamento, Esc/cancelar e retorno de foco. Cadastro na escolha da venda mantém o rascunho; seleção retorna sem criar fiado. Build/lint aprovados; navegador confirmou erro de nome vazio, homônimos sem contato e escolha de cliente com itens preservados. Sem persistência, Google ou documento obrigatório.

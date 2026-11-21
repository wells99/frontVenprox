FEITO - 20/11/2026 (simulação)

# T22 — Configurações do sistema

**Tipo:** página. **Estado:** implementada em memória. **Ordem:** 22. **Data:** 20/11/2026.

[Voltar ao roteiro](../PLANO-DE-TELAS.md) · [Guia geral](../../docs/frontend.md)

## Entrada e conexão

Rodapé da barra lateral → Configurações. Saídas relacionadas: T23, T24. Referência: Guia frontend e decisões posteriores; imagens originais em [LayoutPrograma](../../LayoutPrograma/). Identificadores S01–S10 em [análise geral](../../docs/analise-geral.md).

## Composição

Seções: usuário/permissões, terminal, estoque, impressão e envio. Fotos/Drive como extra futuro indisponível/desativado.

## Interações e retorno

Abrir envios → T23; recuperação opcional → T24 se aprovada; ajustar preferências quando serviços existirem.

## Regras e aceite visual

Permitir venda sem estoque ativo por padrão; automático de impressão desligado; Google desligado e sem coleta de chave agora. Não apresentar backend/integração como pronta.

Validar teclado, foco visível, vazio, erro e carregamento sem perder contexto. Layout prioritário: 1366×768; conferir também 1920×1080 e escala do Windows. Não copiar barras do AnyDesk, publicidade ou marca do legado.

## Limite desta etapa

Implementar esta unidade isoladamente quando chegar sua vez, montando-a na estrutura T00. Não criar as outras telas por antecipação. Nesta fase de frontend, usar apenas dados fictícios identificados quando necessários; persistência, permissões efetivas, impressão, sincronização e Google dependem de adaptadores futuros. Prototipar ação não comprova operação real.


## Entrega e validação

Seções de usuário/permissões, terminal, estoque, impressão e envio/dados. Operador e Balcão 01 são informativos; não há autenticação, cadastro de papéis, senha ou alteração real do computador. Fotos/Google Drive permanecem indisponíveis/desativadas, sem chave ou credencial. T23 permanece explicitamente planejada e T24 opcional/indisponível; não foram antecipadas nesta etapa.

Preferências da demonstração compartilhadas em App.tsx: permitir venda sem estoque ativado por padrão, impressão automática desligada e perfil A4. Salvar política estrita exige produto ativo cadastrado/saldo e desabilita avulso; voltar ao permissivo permite saldo zero/negativo e avulso sem alertas repetidos. Rascunho preserva itens/preços e é validado antes de concluir. Preferência de impressão gera apenas um registro simulado após concluir a venda, com perfil A4/58/80 mm; não instala driver ou impressora, imprime papel nem repete venda. Confirmação/detalhe identificam essa simulação.

Rascunho de preferências preservado ao navegar, descarte para valores salvos, carregamento dos padrões no rascunho e salvamento com bloqueio de repetição/versão/permissão simulada. Falha/conflito mantêm campos e preferências anteriores. Botão de salvar permanece desabilitado e visualmente identificado quando nada mudou. Contagem de vendas pendentes é explicitamente fictícia; serviço remoto e última confirmação real indisponíveis, sem inventar online/sincronizado.

Build e lint aprovados. 41 testes de caixa, estoque, clientes/fiado, lembretes, relatórios e preferências aprovados. Navegador validou defaults, aplicação do modo estrito (avulso indisponível e bloqueio de Café com saldo zero), venda com saldo e registro automático simulado de 80 mm, falha/descarte de preferências, envio indisponível e Drive desligado. Layouts 1366×768, 1920×1080 e largura 375 conferidos sem rolagem horizontal da página; console da versão compilada sem erros/avisos. Captura em `../artifacts/t22-configuracoes.jpg`.

## Limitações

Preferências e dados somente em memória: recarregar restaura os padrões. Impressão, acesso, envio, persistência e integrações reais dependem de serviços/adaptadores futuros. Estoque automático por venda/cancelamento continua pendente; política estrita apenas valida o saldo disponível na simulação. Escala física do Windows, periféricos e ambiente da loja ainda precisam de validação presencial.

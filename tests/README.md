# Testes preservados do frontend

As pastas de testes e de capturas foram mantidas para revisão futura, conforme solicitado. Os testes usam dados fictícios e não acessam serviços ou arquivos de uma loja.

Execute dentro de `front-Venprox`:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

Para executar somente os modelos das T23/T24:

```powershell
node --test tests/sync.test.mjs tests/recovery.test.mjs
```

São 50 testes de modelo nesta entrega: caixa, clientes/fiado, estoque, lembretes, relatórios, preferências, envios e recuperação. Eles verificam regras de estado; a conferência visual e de teclado abaixo é manual no navegador. Não há suíte automatizada de interação com o navegador nesta pasta.

## T23 — roteiro de conferência visual

1. Em Configurações → Envio e dados, abrir Detalhes de envio e suporte. O serviço real deve permanecer não conectado.
2. Percorrer os cenários do seletor. Sem conexão mantém pendências; leitura indisponível mostra desconhecidas; vazio é identificado como exemplo.
3. Marcar falha na próxima consulta e consultar. Conferir carregamento e erro, com o resultado anterior preservado. Desmarcar e tentar novamente.
4. No conflito, abrir a revisão, usar Tab/Shift+Tab, conferir o bloqueio sem o checkbox, registrar a revisão e confirmar que nenhuma pendência desapareceu. Escape fecha e devolve o foco.
5. Em autorização expirada, simular tentativa de renovação. Não solicitar senha nem anunciar autorização renovada.
6. Expandir Detalhes para suporte e selecionar o resumo. Conferir que não inclui clientes ou credenciais.
7. Voltar às Configurações: foco no botão de envio; rascunho de preferências preservado.

## T24 — roteiro de conferência visual

1. Em Configurações → Envio e dados, abrir o assistente. A origem inicial deve ser Usar dados deste computador. As setas navegam entre os rádios.
2. Selecionar backup e percorrer outra loja, versão incompatível, dados ilegíveis, indisponibilidade e origem vazia. Validar cada opção: todas devem bloquear a conclusão, preservando a base em uso.
3. Na origem nuvem, conferir o corte e o aviso de que só contém o que foi recebido; pendências locais são desconhecidas.
4. Simular falha na preparação e repetir sem falha. Conferir progresso, erro e nova tentativa.
5. Validar uma origem saudável e tentar concluir sem as duas conferências. Deve aparecer uma orientação. Marcar ambas e concluir.
6. Navegar às Configurações durante a validação e retornar. A etapa continua na mesma sessão. Recarregar reinicia toda a demonstração.
7. Conferir caixa e terminal deve abrir a página Caixa, sem abrir sessão automaticamente ou gerar movimentos.
8. Conferir que vendas, produtos, clientes, saldos e impressões não foram refeitos ou substituídos. O assistente valida apenas uma prévia isolada.

## Layout e evidências

Conferidos 1366×768, 1920×1080 e largura de 375 px. Página sem excesso de largura; modal com conteúdo rolável e ações acessíveis. Escala física do Windows e periféricos precisam de conferência presencial.

Capturas preservadas em `../artifacts/t23-envios.jpg`, `../artifacts/t24-recuperacao.jpg` e `../artifacts/t24-conclusao.jpg`. As evidências anteriores também foram mantidas. A simulação não valida sincronização, backup, restauração, autenticação ou durabilidade reais.

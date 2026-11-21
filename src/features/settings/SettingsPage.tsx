import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../../ui/AppIcon'
import { demoOperator, demoTerminal } from '../cash/cashDemo'
import { defaultPreferences, preferenceValues, validatePreferences } from './settingsDemo'
import type { DemoPreferences, PreferenceCommand, PreferenceValues, ReceiptProfile } from './settingsDemo'
import '../products/products.css'
import '../products/editor.css'
import './settings.css'
type Props = { active: boolean; returnFocusId?: string; tab: string; onTabChange: (tab: string) => void; preferences: DemoPreferences; pendingSales: number; onOpenSync: () => void; onRecovery: () => void; onSave: (command: PreferenceCommand) => string | undefined }
const sections = [{id:'user',label:'Usuário e permissões',icon:'customers'},{id:'terminal',label:'Terminal',icon:'settings'},{id:'stock',label:'Estoque',icon:'stock'},{id:'print',label:'Impressão',icon:'printer'},{id:'sync',label:'Envio e dados',icon:'reports'}] as const
export function SettingsPage({ active, returnFocusId, tab, onTabChange, preferences, pendingSales, onOpenSync, onRecovery, onSave }: Props) {
  const [draft, setDraft] = useState(() => preferenceValues(preferences))
  const [version, setVersion] = useState(preferences.version)
  const [busy, setBusy] = useState(false)
  const [authorized, setAuthorized] = useState(true)
  const [scenario, setScenario] = useState('normal')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(preferenceValues(preferences))
  useEffect(() => { if (active) { const target = returnFocusId ? document.getElementById(returnFocusId) : heading.current; (target ?? heading.current)?.focus() } },[active,returnFocusId])
  useEffect(() => () => clearTimeout(timer.current),[])
  function change(values: Partial<PreferenceValues>) { setDraft((previous) => ({...previous,...values})); setError(''); setMessage('') }
  function discard() { setDraft(preferenceValues(preferences)); setVersion(preferences.version); setError(''); setMessage('Alterações descartadas. As preferências salvas foram restauradas.') }
  function save() {
    if (lock.current || !dirty) return
    const command: PreferenceCommand = { values: draft, expectedVersion: version, authorized }
    const validation = validatePreferences(preferences,command)
    if (validation) { setError(validation); return }
    lock.current = true; setBusy(true); setMessage(''); setError('')
    timer.current = window.setTimeout(() => {
      const error = scenario === 'error' ? 'Falha simulada. Suas alterações foram mantidas, sem mudar as preferências salvas.' : scenario === 'conflict' ? 'Versão conflitante simulada. Descarte as alterações para revisar as preferências atuais.' : onSave(command)
      lock.current = false; setBusy(false)
      if (error) setError(error)
      else { setVersion(version + 1); setMessage('Preferências aplicadas somente nesta demonstração. Recarregar restaura os padrões.') }
    },550)
  }
  return <section className="products-page settings-page" hidden={!active} aria-labelledby="settings-title">
    <header className="sales-header"><h1 id="settings-title" ref={heading} tabIndex={-1}>Configurações</h1><span className="demo-label"><span aria-hidden="true" />Demonstração · preferências em memória</span></header>
    <p className="settings-context">Preferências deste terminal na demonstração. Não há configuração real do computador, autenticação ou conexão com serviços.</p>
    <div className="settings-layout"><nav aria-label="Seções das configurações">{sections.map((section) => <button key={section.id} className="sales-secondary" aria-pressed={tab === section.id} onClick={() => onTabChange(section.id)}><AppIcon name={section.icon} size={18} />{section.label}</button>)}</nav>
      <form className="settings-content" onSubmit={(event) => { event.preventDefault(); save() }}>
        <fieldset className="settings-fields" disabled={busy}>
          {tab === 'user' && <section className="settings-card"><h2>Usuário e permissões</h2><dl><div><dt>Operador de demonstração</dt><dd>{demoOperator}</dd></div><div><dt>Autenticação</dt><dd>Não implementada nesta base visual</dd></div></dl><p>Os fluxos de cancelamento, caixa e fiado possuem cenários locais de permissão. Eles não representam controle de acesso real.</p><ul><li>Cancelar venda: motivo e permissão simulada.</li><li>Movimentar ou fechar caixa: validação de sessão e permissão simulada.</li><li>Corrigir ou reverter fiado: motivo e permissão simulada.</li></ul><p>Cadastro de usuários, papéis, senhas e revogação de acesso dependem dos serviços futuros.</p></section>}
          {tab === 'terminal' && <section className="settings-card"><h2>Terminal</h2><dl><div><dt>Identificação</dt><dd>{demoTerminal}</dd></div><div><dt>Horários da loja</dt><dd>Brasília · America/Sao_Paulo</dd></div><div><dt>Armazenamento</dt><dd>Dados fictícios em memória</dd></div></dl><p>A sessão de caixa é compartilhada com as vendas e o fiado. Recarregar apaga a sessão aberta e os registros desta demonstração.</p><p>Identificação real do terminal, banco local e instalação desktop ainda não estão conectados.</p></section>}
          {tab === 'stock' && <section className="settings-card"><h2>Política de estoque</h2><label className="settings-check"><input type="checkbox" checked={draft.allowSalesWithoutStock} onChange={(event) => change({allowSalesWithoutStock:event.target.checked})} /><span><strong>Permitir vendas sem estoque</strong><small>Ativado por padrão. Permite saldo zero/negativo e itens avulsos na demonstração, sem alertas repetidos.</small></span></label><p>{draft.allowSalesWithoutStock ? 'Modo permissivo: o atendimento pode seguir sem saldo ou cadastro prévio.' : 'Modo estrito: exige produto ativo cadastrado e saldo suficiente. Itens avulsos ficam indisponíveis.'}</p><p>Salvar aplica a política à montagem da venda e à conferência dos rascunhos em andamento. Os itens e preços do rascunho são mantidos; a validação explica qualquer impedimento antes da conclusão.</p><p>Baixa automática de estoque por venda, reserva concorrente e garantia de saldo entre terminais dependem do serviço futuro.</p></section>}
          {tab === 'print' && <section className="settings-card"><h2>Comprovante não fiscal</h2><label className="settings-check"><input type="checkbox" checked={draft.automaticPrint} onChange={(event) => change({automaticPrint:event.target.checked})} /><span><strong>Imprimir comprovante após cada venda</strong><small>Desligado por padrão. Nesta base, gera somente um registro de impressão simulada após concluir a venda.</small></span></label><label className="settings-profile">Perfil de papel para a simulação<select value={draft.receiptProfile} onChange={(event) => change({receiptProfile:event.target.value as ReceiptProfile})}><option>A4</option><option>58 mm</option><option>80 mm</option></select></label><p>Nenhum papel é impresso. Selecionar um perfil não instala nem configura uma impressora física. Dispositivo, driver e teste de impressão dependem do adaptador e da homologação do equipamento.</p><p>Impressão manual/reimpressão continua disponível na confirmação e no detalhe. Nenhuma ação refaz a venda ou o pagamento.</p></section>}
          {tab === 'sync' && <><section className="settings-card"><h2>Envio e sincronização</h2><dl><div><dt>Serviço remoto</dt><dd>Não conectado</dd></div><div><dt>Vendas marcadas pendentes</dt><dd>{pendingSales} · contagem simulada em memória</dd></div><div><dt>Última confirmação real</dt><dd>Indisponível</dd></div></dl><p>A contagem acima não representa a fila real do terminal. Sem serviço, não é possível confirmar dados enviados, conflitos ou pendências reais.</p><button id="settings-sync-button" type="button" className="sales-secondary" onClick={onOpenSync}>Detalhes de envio e suporte</button></section><section className="settings-card"><h2>Fotos pelo Google Drive</h2><label className="settings-check"><input type="checkbox" checked={false} disabled readOnly /><span><strong>Usar fotos de produtos pelo Google Drive</strong><small>Extra futuro E10 · indisponível e desativado.</small></span></label><p>Cadastro e venda continuam sem fotos. Não há conexão Google, coleta de chave, credenciais ou envio de arquivos nesta etapa.</p></section><section className="settings-card"><h2>Recuperação de dados</h2><p>Assistente opcional para conferir dados deste computador, backup ou nuvem. Nesta demonstração, valida somente cópias fictícias e preserva os dados em uso.</p><button id="settings-recovery-button" type="button" className="sales-secondary" onClick={onRecovery}>Abrir assistente de recuperação</button></section></>}
        </fieldset>
        <div className="settings-save"><p role="status">{busy ? 'Salvando preferências simuladas…' : dirty ? 'Há alterações ainda não aplicadas. Navegar mantém este rascunho.' : 'Nenhuma alteração pendente nas preferências.'}</p>{error && <p className="editor-error" role="alert">{error}</p>}{message && <p className="settings-message" role="status">{message}</p>}<div><button className="sales-secondary" type="button" disabled={busy || !dirty} onClick={discard}>Descartar alterações</button><button className="sales-primary" disabled={busy || !dirty}>Salvar preferências da demonstração</button></div></div>
        <details className="demo-controls"><summary>Cenários das preferências</summary><label className="settings-check"><input type="checkbox" checked={authorized} disabled={busy} onChange={(event) => { setAuthorized(event.target.checked); setError('') }} /><span>Permitir alteração (simulação)</span></label><label>Resultado ao salvar<select value={scenario} disabled={busy} onChange={(event) => setScenario(event.target.value)}><option value="normal">Sucesso</option><option value="error">Falha</option><option value="conflict">Versão conflitante</option></select></label><button type="button" className="sales-secondary" disabled={busy} onClick={() => change(preferenceValues(defaultPreferences))}>Carregar padrões no rascunho</button></details>
      </form></div>
    <p className="products-footnote">Preferências apenas em memória. Autorização efetiva, persistência, impressão e integrações reais não estão implementadas.</p>
  </section>
}

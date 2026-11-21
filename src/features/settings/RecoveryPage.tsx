import { useEffect, useRef, useState } from 'react'
import { demoTerminal } from '../cash/cashDemo'
import { completeRecovery, prepareRecovery, recoveryCandidate, recoverySources, startRecovery } from './recoveryDemo'
import type { DataCounts, RecoveryRun, RecoveryScenario, RecoverySource } from './recoveryDemo'
import './dataTools.css'

const scenarios: {id: RecoveryScenario; label: string}[] = [{id:'healthy',label:'Dados legíveis e compatíveis'},{id:'wrong-store',label:'Cópia de outra loja'},{id:'incompatible',label:'Versão incompatível'},{id:'unreadable',label:'Dados ilegíveis'},{id:'unavailable',label:'Origem indisponível / sem acesso'},{id:'empty',label:'Origem vazia'}]
type Props = { active: boolean; counts: DataCounts; pendingSales: number; onBack: () => void; onReviewCash: () => void }
export function RecoveryPage({ active, counts, pendingSales, onBack, onReviewCash }: Props) {
  const [source, setSource] = useState<RecoverySource>('local')
  const [scenario, setScenario] = useState<RecoveryScenario>('healthy')
  const [fail, setFail] = useState(false)
  const [run, setRun] = useState<RecoveryRun | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [terminalChecked, setTerminalChecked] = useState(false)
  const [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const result = useRef<HTMLHeadingElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  const visible = useRef(active)
  useEffect(() => { visible.current = active; if (active) heading.current?.focus() }, [active])
  useEffect(() => () => clearTimeout(timer.current), [])
  const busy = run?.phase === 'validating'
  const candidate = run?.candidate ?? recoveryCandidate(source,scenario,counts,pendingSales)
  const origin = recoverySources.find((item) => item.id === candidate.source)!
  function reset() { if (lock.current) return; setRun(null); setError(''); setAcknowledged(false); setTerminalChecked(false) }
  function validate() {
    if (lock.current) return
    lock.current = true; setError(''); setAcknowledged(false); setTerminalChecked(false)
    const next = startRecovery(crypto.randomUUID(),recoveryCandidate(source,scenario,counts,pendingSales))
    setRun(next)
    timer.current = window.setTimeout(() => {
      setRun(prepareRecovery(next,fail)); lock.current = false
      if (visible.current) requestAnimationFrame(() => result.current?.focus())
    },900)
  }
  function finish() {
    if (!run || run.phase !== 'review') return
    const completed = completeRecovery(run,acknowledged,terminalChecked)
    if (completed === run) { setError('Confirme a abrangência dos dados e a identificação do terminal antes de concluir a simulação.'); return }
    setRun(completed); setError(''); requestAnimationFrame(() => result.current?.focus())
  }
  return <section className="products-page settings-page data-tools-page recovery-page" hidden={!active} aria-labelledby="recovery-title">
    <header className="sales-header"><h1 id="recovery-title" ref={heading} tabIndex={-1}>Reutilização e recuperação de dados</h1><span className="demo-label"><span aria-hidden="true" />Assistente opcional · simulação</span></header>
    <div className="data-toolbar"><button className="sales-secondary" onClick={onBack}>Voltar às configurações</button></div>
    <p className="data-real-status"><strong>Seus dados em uso serão preservados.</strong> Este assistente demonstra diagnóstico e conferência com dados fictícios. Nenhum arquivo é aberto, importado, apagado ou restaurado; não há conexão com a nuvem.</p>
    <div className="data-tools-content">
      <ol className="recovery-steps" aria-label="Etapas da recuperação"><li aria-current={!run || run.phase === 'failed' ? 'step' : undefined}>1 · Escolher origem</li><li aria-current={busy || run?.phase === 'review' ? 'step' : undefined}>2 · Validar e conferir</li><li aria-current={run?.phase === 'complete' ? 'step' : undefined}>3 · Concluir demonstração</li></ol>
      {!run || run.phase === 'failed' ? <>
        <fieldset className="recovery-origins"><legend>1 · De onde vêm os dados?</legend><div>{recoverySources.map((item) => <label key={item.id} className={source === item.id ? 'is-selected' : ''}><input type="radio" name="recovery-source" value={item.id} checked={source === item.id} onChange={() => { reset(); setSource(item.id) }} /><span><strong>{item.title}</strong><small>{item.description}</small></span></label>)}</div></fieldset>
        <section className="settings-card data-scenario"><label>Condição da origem fictícia<select value={scenario} onChange={(event) => { reset(); setScenario(event.target.value as RecoveryScenario) }}>{scenarios.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="settings-check"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} /><span>Simular falha durante a preparação</span></label></section>
      </> : null}
      <section className="settings-card" aria-busy={busy}>
        <div className="data-status-heading"><h2 ref={result} tabIndex={-1}>{busy ? 'Validando a cópia fictícia…' : run?.phase === 'complete' ? 'Demonstração concluída · base em uso preservada' : run?.phase === 'review' ? 'Cópia fictícia validada · confira o corte' : run?.phase === 'failed' ? 'Validação interrompida · base preservada' : 'Diagnóstico da origem selecionada'}</h2><span className="data-badge">{origin.title}</span></div>
        {busy && <div className="recovery-progress" role="status"><progress aria-label="Preparação da cópia fictícia" /><p>Conferindo legibilidade, loja, compatibilidade e abrangência. Dados parciais não serão liberados.</p></div>}
        {run?.errors.length ? <div className="editor-error" role="alert"><ul>{run.errors.map((message) => <li key={message}>{message}</li>)}</ul></div> : null}
        <dl><div><dt>Loja da origem</dt><dd>{candidate.storeName} · {candidate.storeId}</dd></div><div><dt>Diagnóstico</dt><dd>{!candidate.available ? 'Origem indisponível' : !candidate.readable ? 'Dados ilegíveis · situação desconhecida' : !candidate.compatible ? 'Versão incompatível' : run?.phase === 'review' || run?.phase === 'complete' ? 'Legibilidade e compatibilidade validadas no exemplo' : 'Legível e compatível no exemplo · aguarda validação'}</dd></div><div><dt>Corte dos dados</dt><dd>{candidate.cutoff}</dd></div><div><dt>Última confirmação remota</dt><dd>{candidate.lastReceived}</dd></div><div><dt>Registros da origem</dt><dd>{candidate.counts ? `${candidate.counts.sales} vendas · ${candidate.counts.products} produtos · ${candidate.counts.customers} clientes` : 'Desconhecidos · não é uma base vazia'}</dd></div><div><dt>Vendas marcadas pendentes</dt><dd>{candidate.pendingSales === undefined ? 'Desconhecidas · não significa zero' : `${candidate.pendingSales} · somente vendas do exemplo`}</dd></div><div><dt>Terminal a conferir</dt><dd>{demoTerminal} · loja de demonstração</dd></div></dl>
        <div className="recovery-scope"><p><strong>{candidate.source === 'cloud' ? 'A nuvem só contém o que recebeu.' : candidate.source === 'backup' ? 'Um backup representa um corte no tempo.' : 'Dados locais saudáveis podem ser reutilizados após validação.'}</strong> {candidate.source === 'local' ? 'A versão real precisará validar banco local e autorização para operação offline. Nesta base há somente dados em memória.' : 'Vendas nunca enviadas e alterações posteriores ao corte podem estar ausentes. A fila atual de um computador sem contato não pode ser deduzida desta cópia.'}</p><p>Clientes/fiado, agenda e movimentos exigirão conferência própria no serviço real. Esta prévia não certifica a recuperação desses registros. Não refaz vendas, recebimentos, saídas de caixa ou impressões.</p></div>
        {!run && <button className="sales-primary" onClick={validate}>Validar origem fictícia</button>}
        {run?.phase === 'failed' && <button className="sales-primary" onClick={validate}>Tentar validar novamente</button>}
        {run?.phase === 'review' && <form className="recovery-review" onSubmit={(event) => { event.preventDefault(); finish() }}>
          <label className="settings-check"><input type="checkbox" checked={acknowledged} onChange={(event) => { setAcknowledged(event.target.checked); setError('') }} /><span>Conferi a loja e o corte. Entendo que dados ausentes ou nunca enviados não estão garantidos nesta cópia.</span></label>
          <label className="settings-check"><input type="checkbox" checked={terminalChecked} onChange={(event) => { setTerminalChecked(event.target.checked); setError('') }} /><span>Conferi o terminal {demoTerminal}. Vou revisar a sessão de caixa antes de retomar vendas.</span></label>
          {error && <p role="alert" className="editor-error">{error}</p>}
          <div className="data-toolbar"><button type="button" className="sales-secondary" onClick={reset}>Voltar à escolha da origem</button><button className="sales-primary">Concluir simulação</button></div>
        </form>}
        {run?.phase === 'complete' && <div className="recovery-complete"><p className="settings-message" role="status">A validação e a conferência do exemplo terminaram. Nenhum dado foi promovido à base em uso. A restauração real depende do serviço local e de uma troca atômica após validação.</p><div className="data-toolbar"><button className="sales-primary" onClick={onReviewCash}>Conferir caixa e terminal</button><button className="sales-secondary" onClick={onBack}>Concluir e voltar às configurações</button><button className="sales-secondary" onClick={reset}>Iniciar outra simulação</button></div></div>}
      </section>
      <p className="products-footnote">A etapa e o resultado ficam nesta sessão ao trocar de página. Recarregar reinicia a demonstração. Não há limpeza de base, detecção de reinstalação ou restauração real nesta etapa.</p>
    </div>
  </section>
}

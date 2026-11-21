import { useEffect, useRef, useState } from 'react'
import type { Sale } from '../sales/demoSales'
import { DemoDialog } from '../sales/DemoDialog'
import { demoTerminal } from '../cash/cashDemo'
import { pendingAgeLabel, syncScenarios, syncSnapshot } from './syncDemo'
import type { SyncScenario } from './syncDemo'
import './dataTools.css'

export function SyncPage({ active, sales, onBack }: { active: boolean; sales: Sale[]; onBack: () => void }) {
  const [scenario, setScenario] = useState<SyncScenario>('offline')
  const [consultation, setConsultation] = useState<'ready' | 'loading' | 'error'>('ready')
  const [fail, setFail] = useState(false)
  const [dialog, setDialog] = useState<'conflict' | 'auth' | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const [notice, setNotice] = useState('')
  const [checked, setChecked] = useState(false)
  const [snapshot, setSnapshot] = useState(() => syncSnapshot(sales, 'offline', Date.now()))
  const timer = useRef<number | undefined>(undefined)
  const heading = useRef<HTMLHeadingElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const lock = useRef(false)
  useEffect(() => { if (active) heading.current?.focus() }, [active])
  useEffect(() => { const close = () => setDialog(null); window.addEventListener('hashchange', close); return () => window.removeEventListener('hashchange', close) }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  const context = syncScenarios.find((item) => item.id === scenario)!
  function consult() {
    if (lock.current) return
    lock.current = true; setConsultation('loading'); setNotice('')
    timer.current = window.setTimeout(() => { setConsultation(fail ? 'error' : 'ready'); if (!fail) setSnapshot(syncSnapshot(sales,scenario,Date.now())); lock.current = false }, 650)
  }
  function openDialog(value: 'conflict' | 'auth') { returnFocus.current = document.activeElement as HTMLElement; setChecked(false); setDialog(value) }
  function closeDialog() { setDialog(null); requestAnimationFrame(() => returnFocus.current?.focus()) }
  const support = `VENPROX · DIAGNÓSTICO FICTÍCIO\nReferência: DEMO-ENV-023\nTerminal: ${demoTerminal}\nServiço real: não conectado\nCenário: ${context.label}\nPendências do exemplo: ${snapshot.count ?? 'desconhecidas'}\nIdade: ${pendingAgeLabel(snapshot.ageMinutes)}\nÚltimo sucesso: ${snapshot.lastSuccess ?? 'desconhecido'}\nEscopo: vendas em memória; não é a fila real. Nenhum dado foi enviado ou apagado.`
  return <section className="products-page settings-page data-tools-page" hidden={!active} aria-labelledby="sync-title">
    <header className="sales-header"><h1 id="sync-title" ref={heading} tabIndex={-1}>Status de envio e suporte</h1><span className="demo-label"><span aria-hidden="true" />Demonstração · sem serviço remoto</span></header>
    <div className="data-toolbar"><button className="sales-secondary" onClick={onBack}>Voltar às configurações</button><button className="sales-secondary" onClick={consult} disabled={consultation === 'loading'}>Consultar cenário novamente</button></div>
    <p className="data-real-status"><strong>Serviço real não conectado.</strong> Pendências reais e última confirmação real indisponíveis. Os exemplos abaixo não comprovam envio ou proteção em nuvem.</p>
    <div className="data-tools-content">
      <section className="settings-card data-scenario"><label>Cenário fictício de envio<select value={scenario} disabled={consultation === 'loading'} onChange={(event) => { setScenario(event.target.value as SyncScenario); setSnapshot(syncSnapshot(sales,event.target.value as SyncScenario,Date.now())); setConsultation('ready'); setReviewed(false); setNotice('') }}>{syncScenarios.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="settings-check"><input type="checkbox" checked={fail} disabled={consultation === 'loading'} onChange={(event) => setFail(event.target.checked)} /><span>Simular falha na próxima consulta</span></label></section>
      <div aria-live="polite" aria-busy={consultation === 'loading'}>{consultation === 'loading' && <p className="data-notice">Consultando o exemplo… O último resultado está preservado abaixo.</p>}{consultation === 'error' && <p className="editor-error" role="alert">Falha simulada na consulta. Os valores abaixo são do último resultado, sem confirmação atual. Tente consultar novamente.</p>}</div>
      <section className="settings-card"><div className="data-status-heading"><h2>{context.title}</h2><span className="data-badge">{consultation === 'ready' ? 'Resultado fictício' : 'Resultado anterior'}</span></div><p>{context.guidance}</p>
        <dl className="data-metrics"><div><dt>Pendências do exemplo</dt><dd>{snapshot.count ?? 'Desconhecidas'}</dd></div><div><dt>Mais antiga · idade</dt><dd>{snapshot.count === 0 ? 'Sem pendências no exemplo' : pendingAgeLabel(snapshot.ageMinutes)}</dd></div><div><dt>Último sucesso do exemplo</dt><dd>{snapshot.lastSuccess ?? 'Desconhecido'}</dd></div><div><dt>Conflitos do exemplo</dt><dd>{snapshot.conflicts ?? 'Desconhecidos'}</dd></div></dl>
        <p>Escopo da contagem: vendas marcadas nesta sessão de demonstração. Cadastros, fiado, agenda e movimentos não possuem fila de envio nesta base. A idade usa o horário disponível da venda e só aparece quando é possível calculá-la.</p>
        {scenario === 'conflict' && <div className="data-action"><p><strong>Produto Café · preço alterado em duas versões.</strong>{reviewed && ' Revisão simulada registrada; o envio continua pendente.'}</p><button className="sales-secondary" disabled={consultation !== 'ready'} onClick={() => openDialog('conflict')}>Rever conflito de produto</button></div>}
        {scenario === 'auth' && <button className="sales-secondary" disabled={consultation !== 'ready'} onClick={() => openDialog('auth')}>Rever autorização</button>}
      </section>
      {notice && <p className="settings-message" role="status">{notice}</p>}
      <details className="settings-card data-support"><summary>Detalhes para suporte</summary><p>Resumo fictício sem nomes de clientes, pagamentos ou credenciais. Selecione o texto para copiá-lo; nenhum atendimento é enviado por esta tela.</p><label>Resumo do diagnóstico<textarea readOnly rows={10} value={support} onFocus={(event) => event.currentTarget.select()} /></label></details>
      <p className="products-footnote">Não refaça operações nem apague pendências para tentar corrigir um envio. Recarregar esta demonstração restaura os dados fictícios iniciais.</p>
    </div>
    {active && dialog && <DemoDialog title={dialog === 'conflict' ? 'Rever conflito de produto' : 'Rever autorização'} eyebrow="Demonstração · nenhuma alteração remota" onClose={closeDialog} className="catalog-dialog data-dialog"><div className="editor-body">
      {dialog === 'conflict' ? <><p>Exemplo fictício: o preço do Café foi alterado neste terminal e em outro local. O cadastro real da demonstração não será modificado.</p><dl><div><dt>Neste computador</dt><dd>R$ 3,50 · versão fictícia 2</dd></div><div><dt>Recebido do servidor</dt><dd>R$ 4,00 · versão fictícia 3</dd></div></dl><p>Confirme o valor com o responsável. A integração futura deverá validar a versão antes de aplicar qualquer decisão.</p><label className="settings-check"><input data-initial-focus type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>Conferi as diferenças deste exemplo</span></label></> : <><p>A autorização do exemplo expirou. A renovação real depende de autenticação e conexão com o serviço, ainda não implementados.</p><p>Nenhuma senha ou credencial será coletada. A ação abaixo demonstra somente o retorno após uma tentativa.</p></>}
      </div><footer><button className="sales-secondary" onClick={closeDialog}>Voltar sem alterar</button><button className="sales-primary" disabled={dialog === 'conflict' && !checked} onClick={() => { if (dialog === 'conflict') { setReviewed(true); setNotice('Revisão registrada apenas no exemplo. Conflito e pendências preservados até uma decisão validada pelo serviço.') } else setNotice('Tentativa simulada. Serviço de autenticação indisponível; autorização e pendências permanecem inalteradas.'); closeDialog() }}>{dialog === 'conflict' ? 'Registrar revisão simulada' : 'Simular tentativa de renovação'}</button></footer></DemoDialog>}
  </section>
}

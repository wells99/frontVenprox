import { useEffect, useRef, useState } from 'react'
import { AppIcon, PaymentIcon } from '../../ui/AppIcon'
import { dateLabel, money, normalize } from '../sales/demoSales'
import { cashMethods, demoTerminal, movementTotal, summarizeCash } from './cashDemo'
import type { CashSession, ManualCashKind } from './cashDemo'
import './cash.css'

type Props = { active: boolean; route: string; sessions: CashSession[]; onOpen: () => void; onMovement: (kind: ManualCashKind) => void; onClosing: () => void }
const when = (at: string) => new Date(at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const kinds = { opening: 'Abertura', sale: 'Venda', cancellation: 'Cancelamento', 'credit-receipt': 'Recebimento de fiado', 'credit-reversal': 'Reversão de fiado', supply: 'Suprimento', withdrawal: 'Sangria' }

export function CashPage({ active, route, sessions, onOpen, onMovement, onClosing }: Props) {
  const past = route.startsWith('/caixa/anteriores')
  const current = sessions.find((session) => !session.closedAt && session.terminal === demoTerminal)
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [scenario, setScenario] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previous = sessions.filter((session) => session.closedAt && normalize([session.number, session.operator, session.terminal].join(' ')).includes(normalize(query.trim())) && (!date || session.openedAt.startsWith(date)))
  const sessionNumber = Number(route.split('/')[3])
  const selected = past ? previous.find((session) => session.number === sessionNumber) ?? previous[0] : current
  useEffect(() => { if (active) headingRef.current?.focus() }, [active])
  useEffect(() => {
    if (scenario !== 'loading') return
    const timer = window.setTimeout(() => setScenario('normal'), 700)
    return () => window.clearTimeout(timer)
  }, [scenario])
  function changeTab(previous: boolean) { window.location.hash = previous ? '/caixa/anteriores' : '/caixa' }
  return <section className="cash-page" hidden={!active} aria-labelledby="cash-title">
    <header className="sales-header"><h1 id="cash-title" ref={headingRef} tabIndex={-1}>Caixa</h1><span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span></header>
    <div className="cash-topline"><p>Controle o dinheiro da gaveta e acompanhe os recebimentos por meio.</p><span><AppIcon name="cash" size={16} />{demoTerminal}</span></div>
    <div role="tablist" aria-label="Sessões de caixa" className="cash-tabs">{[{ label: 'Caixa atual', previous: false }, { label: 'Caixas anteriores', previous: true }].map((tab) => <button key={tab.label} type="button" role="tab" id={tab.previous ? 'cash-past-tab' : 'cash-current-tab'} aria-controls="cash-tabpanel" aria-selected={past === tab.previous} tabIndex={past === tab.previous ? 0 : -1} onClick={() => changeTab(tab.previous)} onKeyDown={(event) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const goPast = event.key === 'End' || event.key === 'ArrowRight'; changeTab(goPast); document.getElementById(goPast ? 'cash-past-tab' : 'cash-current-tab')?.focus() }
    }}>{tab.label}{!tab.previous && current && <span>Aberto</span>}</button>)}</div>
    <div role="tabpanel" id="cash-tabpanel" aria-labelledby={past ? 'cash-past-tab' : 'cash-current-tab'}>
      {past && <form className="cash-history-filters" aria-label="Filtros de caixas anteriores" onSubmit={(event) => event.preventDefault()}><label>Buscar caixa<input type="search" placeholder="Número, operador ou terminal" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Data de abertura<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>{(query || date) && <button type="button" className="sales-text-button" onClick={() => { setQuery(''); setDate('') }}>Limpar filtros</button>}</form>}
      {scenario === 'loading' ? <div className="cash-empty" role="status"><AppIcon name="cash" size={32} /><h2>Carregando caixas…</h2><p>Consulta simulada. Seus filtros serão mantidos.</p></div>
      : scenario === 'error' ? <div className="cash-empty" role="alert"><h2>Não foi possível consultar o caixa</h2><p>Falha simulada. A sessão e os movimentos em memória foram mantidos.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Tentar novamente</button></div>
      : past ? <>
        <p className="cash-result" role="status">{scenario === 'empty' ? 0 : previous.length} {previous.length === 1 && scenario !== 'empty' ? 'caixa encontrado' : 'caixas encontrados'}</p>
        {!previous.length || scenario === 'empty' ? <div className="cash-empty"><AppIcon name="search" size={30} /><h2>Nenhum caixa encontrado</h2><p>{scenario === 'empty' ? 'Nenhum registro no cenário de consulta vazia.' : 'Ajuste a busca ou a data para consultar outras sessões.'}</p><button className="sales-secondary" onClick={() => { setQuery(''); setDate(''); setScenario('normal') }}>Restaurar consulta</button></div> : <>
          <div className="cash-session-list" aria-label="Caixas encerrados">{previous.map((session) => <button key={session.number} className={'cash-session-choice' + (selected?.number === session.number ? ' is-selected' : '')} aria-pressed={selected?.number === session.number} onClick={() => { window.location.hash = '/caixa/anteriores/' + session.number }}><strong>Caixa #{session.number}<span>Fechado</span></strong><span>{dateLabel(session.openedAt.slice(0, 10))} · {session.operator}</span><small>{session.terminal} · encerrado às {new Date(session.closedAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></button>)}</div>
          {selected && <SessionOverview key={selected.number} session={selected} />}
        </>}
      </> : !current ? <div className="cash-empty cash-closed"><div className="cash-empty-icon"><AppIcon name="cash" size={32} /></div><h2>Nenhum caixa aberto neste terminal</h2><p>Informe o valor que já está na gaveta antes de iniciar as vendas.</p><button id="open-cash-button" className="sales-primary" onClick={onOpen}><AppIcon name="add" size={17} />Abrir caixa</button><button className="sales-text-button" onClick={() => changeTab(true)}>Consultar caixas anteriores</button><small>Uma sessão por terminal · abertura apenas na demonstração</small></div>
      : <SessionOverview key={current.number} session={current} onMovement={onMovement} onClosing={onClosing} />}
    </div>
    <details className="demo-controls cash-scenarios"><summary>Cenários de demonstração</summary><div><p>Abertura, vendas e movimentos existem apenas em memória. Nenhum caixa real foi aberto.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Simular carregamento</button><button className="sales-secondary" onClick={() => setScenario('error')}>Simular falha de consulta</button>{past && <button className="sales-secondary" onClick={() => setScenario(scenario === 'empty' ? 'normal' : 'empty')}>{scenario === 'empty' ? 'Restaurar consulta' : 'Simular consulta vazia'}</button>}</div></details>
  </section>
}

function SessionOverview({ session, onMovement, onClosing }: { session: CashSession; onMovement?: (kind: ManualCashKind) => void; onClosing?: () => void }) {
  const [kind, setKind] = useState('')
  const [method, setMethod] = useState('')
  const totals = summarizeCash(session)
  const movements = session.movements.filter((movement) => (!kind || movement.kind === kind) && (!method || (movement.amounts[method as keyof typeof movement.amounts] ?? 0) !== 0 || (movement.kind === 'opening' && method === 'Dinheiro'))).toSorted((a, b) => Date.parse(b.at) - Date.parse(a.at) || b.id.localeCompare(a.id))
  const difference = session.countedCashCents === undefined ? undefined : session.countedCashCents - (session.closing?.expected.Dinheiro ?? totals.expectedCash)
  return <>
    <div className="cash-session-heading"><div><h2>Caixa #{session.number}<span className={'cash-state ' + (session.closedAt ? 'is-closed' : 'is-open')}>{session.closedAt ? 'Fechado' : 'Aberto'}</span></h2><p>Aberto em {when(session.openedAt)} · {session.operator} · {session.terminal}</p>{session.closedAt && <p>Encerrado em {when(session.closedAt)} · valores registrados no fechamento</p>}</div><span className={'sync-badge ' + (session.sync === 'Pendente' ? 'pending' : 'received')}>{session.sync === 'Pendente' ? 'Envio pendente' : 'Envio recebido'} · simulado</span></div>
    <div className="cash-overview-grid">
      <div className="cash-overview-main">
        <div className="cash-balance-cards"><article className="cash-balance cash-physical"><div><AppIcon name="money" size={21} /><h3>{session.closedAt ? 'Dinheiro esperado no fechamento' : 'Dinheiro esperado na gaveta'}</h3></div><strong>{money(totals.expectedCash)}</strong><p>Somente dinheiro físico · inclui o valor inicial.</p></article><article className="cash-balance"><div><AppIcon name="card" size={21} /><h3>Recebimentos digitais líquidos</h3></div><strong>{money(totals.digital)}</strong><p>Pix, crédito e débito · separados da gaveta.</p></article></div>
        <div className="cash-summary-grid">
          <article className="cash-card"><h3>Resumo da sessão</h3><dl className="cash-breakdown"><div><dt>Valor inicial em dinheiro</dt><dd>{money(totals.opening)}</dd></div><div><dt>Vendas registradas</dt><dd>{money(totals.sales)}</dd></div><div><dt>Cancelamentos da sessão</dt><dd>− {money(totals.cancellations)}</dd></div><div className="cash-net-sales"><dt>Vendas líquidas</dt><dd>{money(totals.sales - totals.cancellations)}</dd></div><div><dt>Fiado recebido, menos reversões</dt><dd>{money(totals.creditReceipts)}</dd></div><div><dt>Suprimentos em dinheiro</dt><dd>{money(totals.supplies)}</dd></div><div><dt>Sangrias em dinheiro</dt><dd>− {money(totals.withdrawals)}</dd></div></dl><p className="cash-hint">Fiado recebido é uma entrada separada de vendas. Lembretes de contas não movimentam caixa.</p>
            {session.closedAt && <div className="cash-closing-values"><h4>Conferência registrada (fictícia)</h4><dl className="cash-breakdown"><div><dt>Dinheiro contado</dt><dd>{money(session.countedCashCents ?? 0)}</dd></div><div><dt>Diferença em dinheiro</dt><dd className={difference ? 'cash-difference' : ''}>{difference === undefined ? 'Não informada' : money(difference)}</dd></div></dl>{Boolean(difference) && <p>Diferença de demonstração: valor contado {difference! < 0 ? 'menor' : 'maior'} que o esperado.</p>}{session.closing && <><p>Fechado na demonstração por {session.closing.operator}. Envio pendente simulado; sem conciliação online.</p><dl className="cash-breakdown">{cashMethods.filter((method) => method !== 'Dinheiro').map((method) => <div key={method}><dt>{method} conferido<br /><small>Diferença: {money(session.closing!.counted[method] - session.closing!.expected[method])}</small></dt><dd>{money(session.closing!.counted[method])}</dd></div>)}</dl>{session.closing.reason && <p className="cash-closing-reason">Motivo das diferenças: {session.closing.reason}</p>}</>}</div>}
          </article>
          <article className="cash-card"><h3>Recebimentos por meio</h3><p className="cash-hint">Vendas e fiado, descontados cancelamentos e reversões. Valor inicial e movimentos da gaveta ficam separados.</p><ul className="cash-methods">{cashMethods.map((paymentMethod) => {
            const receipts = session.movements.filter((movement) => ['sale', 'cancellation', 'credit-receipt', 'credit-reversal'].includes(movement.kind)).reduce((sum, movement) => sum + (movement.amounts[paymentMethod] ?? 0), 0)
            return <li key={paymentMethod}><span><PaymentIcon method={paymentMethod} size={20} />{paymentMethod}<small>Vendas líquidas: {money(totals.salesByMethod[paymentMethod])}</small></span><strong>{money(receipts)}</strong></li>
          })}</ul><p className="cash-hint">Valores informados manualmente. Não representam conciliação ou confirmação bancária.</p></article>
        </div>
        {!session.closedAt && <div className="cash-planned-actions"><div><button id="cash-supply-button" className="sales-secondary" onClick={() => onMovement?.('supply')}>Adicionar dinheiro · Suprimento</button><button id="cash-withdrawal-button" className="sales-secondary" onClick={() => onMovement?.('withdrawal')}>Remover valores · Sangria</button><button id="close-cash-button" className="sales-primary" onClick={onClosing}>Fechar caixa</button></div><p>Suprimentos e sangrias alteram somente o dinheiro da gaveta. Confira os valores antes de encerrar a sessão.</p></div>}
        {session.closedAt && <p className="cash-notice">Consulta de uma sessão encerrada. Seus movimentos e valores de fechamento são preservados; restituições posteriores não recalculam este caixa.</p>}
      </div>
      <aside className="cash-card cash-movements" aria-label="Movimentação da sessão"><div className="cash-movements-heading"><h3>Movimentação</h3><span>{session.movements.length} {session.movements.length === 1 ? 'registro' : 'registros'}</span></div><div className="cash-movement-filters"><label>Tipo<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Todos os movimentos</option>{Object.entries(kinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Meio<select value={method} onChange={(event) => setMethod(event.target.value)}><option value="">Todos os meios</option>{cashMethods.map((paymentMethod) => <option key={paymentMethod}>{paymentMethod}</option>)}</select></label></div>
        <p className="cash-hint" role="status">{movements.length} {movements.length === 1 ? 'movimento no filtro' : 'movimentos no filtro'} · mais recentes primeiro</p>
        {!movements.length ? <div className="cash-movement-empty"><p>Nenhum movimento neste filtro.</p><button className="sales-text-button" onClick={() => { setKind(''); setMethod('') }}>Limpar filtros de movimentos</button></div> : <ol className="cash-timeline">{movements.map((movement) => <li key={movement.id} className={movementTotal(movement) < 0 ? 'is-outflow' : ''}><div><strong>{movement.description}</strong><time dateTime={movement.at}>{new Date(movement.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time></div><span className="cash-movement-value">{money(movementTotal(movement))}</span><ul>{cashMethods.filter((paymentMethod) => (movement.amounts[paymentMethod] ?? 0) !== 0 || (movement.kind === 'opening' && paymentMethod === 'Dinheiro')).map((paymentMethod) => <li key={paymentMethod}><PaymentIcon method={paymentMethod} size={13} />{paymentMethod} · {money(movement.amounts[paymentMethod] ?? 0)}</li>)}</ul><small>{movement.operator}</small></li>)}</ol>}
        <p className="cash-movements-note">Os filtros alteram somente a lista. O resumo considera a sessão inteira.</p>
      </aside>
    </div>
    <p className="cash-memory">Dados fictícios em memória, sem gravação local ou envio a servidor. Movimentos de fiado, suprimento e sangria dos caixas anteriores são exemplos fixos.</p>
  </>
}

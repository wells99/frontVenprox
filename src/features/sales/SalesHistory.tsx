import { AppIcon, PaymentIcon } from '../../ui/AppIcon'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { dateLabel, money, normalize, totalCents } from './demoSales'
import type { Sale } from './demoSales'
import { SaleDetail } from './SaleDetail'
import './sales.css'

type Props = { active: boolean; route: string; sales: Sale[]; onCancel: (id: string, reason: string, authorized: boolean) => void; onPrint: (id: string) => void }
const pageSize = 8

export function SalesHistory({ active, route, sales, onCancel, onPrint }: Props) {
  const [query, setQuery] = useState('')
  const [payment, setPayment] = useState('')
  const [status, setStatus] = useState('')
  const [sync, setSync] = useState('')
  const [session, setSession] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(sales[0]?.id ?? '')
  const [scenario, setScenario] = useState<'normal' | 'loading' | 'error'>('normal')
  const searchRef = useRef<HTMLInputElement>(null)
  const returnId = useRef<string | undefined>(undefined)
  const wasOverlay = useRef(false)
  const openedHere = useRef(false)
  const invalidRange = Boolean(from && to && from > to)
  const hasFilters = Boolean(query || payment || status || sync || session || from || to)
  const filtered = sales.filter((sale) => {
    const text = normalize([sale.number, sale.customer, sale.operator, ...sale.items.map((item) => item.name)].join(' '))
    return !invalidRange && text.includes(normalize(query.trim())) && (!payment || sale.payment === payment) && (!status || sale.status === status) && (!sync || sale.sync === sync) && (!session || String(sale.cashSession) === session) && (!from || sale.date >= from) && (!to || sale.date <= to)
  }).sort((a, b) => sort === 'value' ? totalCents(b) - totalCents(a) || b.number - a.number : sort === 'old' ? a.number - b.number : b.number - a.number)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selected = visible.find((sale) => sale.id === selectedId) ?? visible[0]
  const routePart = route.split('/')[2]
  const preview = sales.find((sale) => sale.id === routePart)
  const overlay = active && Boolean(routePart)
  const completed = filtered.filter((sale) => sale.status === 'Concluída')

  function navigate(destination: string) {
    openedHere.current = true
    if (destination !== 'nova') { returnId.current = destination; setSelectedId(destination) }
    window.location.hash = '/vendas/' + destination
  }
  function closeOverlay() {
    if (openedHere.current) { openedHere.current = false; window.history.back() }
    else window.location.replace('#/vendas')
  }
  function clearFilters() {
    setQuery(''); setPayment(''); setStatus(''); setSync(''); setSession(''); setFrom(''); setTo(''); setPage(1)
    searchRef.current?.focus()
  }
  function changePage(next: number) { setPage(next) }
  function moveRow(event: KeyboardEvent<HTMLTableRowElement>, index: number) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const next = Math.max(0, Math.min(visible.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))
    setSelectedId(visible[next].id)
    document.getElementById('open-' + visible[next].id)?.focus()
  }

  useEffect(() => {
    if (active) searchRef.current?.focus()
  }, [active])

  useEffect(() => {
    if (scenario !== 'loading') return
    const timer = window.setTimeout(() => setScenario('normal'), 900)
    return () => window.clearTimeout(timer)
  }, [scenario])

  useEffect(() => {
    if (wasOverlay.current && !overlay && active) {
      const button = document.getElementById('open-' + returnId.current)
      if (button) button.focus()
      else searchRef.current?.focus()
    }
    wasOverlay.current = overlay
  }, [overlay, active])

  useEffect(() => {
    if (!active || overlay) return
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
      if (event.key === 'F3') { event.preventDefault(); navigate('nova') }
      if (event.key === 'F2' && selected && scenario === 'normal') { event.preventDefault(); navigate(selected.id) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, overlay, selected, scenario])

  return <section className="sales-page" hidden={!active} aria-labelledby="sales-title">
    <header className="sales-header">
      <h1 id="sales-title" tabIndex={-1}>Vendas</h1>
      <span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span>
    </header>
    <div className="sales-actions">
      <button id="new-sale-button" className="sales-primary" onClick={() => navigate('nova')}><AppIcon name="add" size={16} /> Nova Venda <kbd>F3</kbd></button>
      <p>Consulte e acompanhe o histórico de vendas.</p>
    </div>
    <div className="sales-tabs"><span aria-current="page">Histórico</span></div>

    <form className="sales-filters" aria-label="Filtros do histórico" onSubmit={(event) => event.preventDefault()}>
      <label className="sales-search">Buscar venda
        <span className="search-field"><AppIcon name="search" size={18} /><input ref={searchRef} type="search" placeholder="Número, produto, cliente ou operador" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></span>
      </label>
      <label>Caixa<select aria-label="Caixa" value={session} onChange={(event) => { setSession(event.target.value); setPage(1) }}><option value="">Todos os caixas</option>{Array.from(new Set(sales.map((sale) => sale.cashSession))).sort((a, b) => b - a).map((number) => <option key={number} value={String(number)}>Caixa #{number}</option>)}</select></label>
      <label>Pagamento<select aria-label="Pagamento" value={payment} onChange={(event) => { setPayment(event.target.value); setPage(1) }}><option value="">Todos os meios</option>{['Dinheiro', 'Pix', 'Crédito', 'Débito', 'Misto'].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Situação<select aria-label="Situação" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">Todas</option><option>Concluída</option><option>Cancelada</option></select></label>
      <label>Envio<select aria-label="Envio" value={sync} onChange={(event) => { setSync(event.target.value); setPage(1) }}><option value="">Todos</option><option value="Pendente">Pendente (simulado)</option><option value="Recebida">Recebida (simulado)</option></select></label>
      <label>De<input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1) }} aria-invalid={invalidRange} aria-describedby={invalidRange ? 'range-error' : undefined} /></label>
      <label>Até<input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1) }} aria-invalid={invalidRange} /></label>
      {hasFilters && <button className="sales-text-button clear-filters" type="button" onClick={clearFilters}>Limpar filtros</button>}
    </form>
    {invalidRange && <p id="range-error" className="sales-range-error" role="alert">A data inicial deve ser anterior ou igual à data final.</p>}

    <div className="history-toolbar">
      <p role="status">{scenario === 'normal' ? <><strong>{filtered.length}</strong> {filtered.length === 1 ? 'venda encontrada' : 'vendas encontradas'}</> : scenario === 'loading' ? 'Carregando histórico…' : 'Histórico indisponível'}</p>
      <label>Ordenar por <select aria-label="Ordenar por" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}><option value="recent">Mais recentes</option><option value="old">Mais antigas</option><option value="value">Maior valor</option></select></label>
    </div>

    {scenario === 'error' ? <div className="sales-empty" role="alert"><h2>Não foi possível carregar as vendas</h2><p>Falha simulada para testar o retorno à lista. Seus filtros foram mantidos.</p><button className="sales-primary" onClick={() => setScenario('loading')}>Tentar novamente</button></div>
    : scenario === 'loading' ? <div className="sales-skeleton" role="status" aria-label="Carregando vendas">{Array.from({ length: 6 }, (_, index) => <div key={index} />)}</div>
    : !visible.length ? <div className="sales-empty"><AppIcon name="search" size={34} className="empty-symbol" /><h2>Nenhuma venda encontrada</h2><p>{invalidRange ? 'Ajuste o intervalo de datas para consultar o histórico.' : 'Experimente outro termo ou ajuste os filtros da busca.'}</p><button className="sales-secondary" onClick={clearFilters}>Limpar filtros</button></div>
    : <div className="sales-table-scroll"><table className="sales-table"><caption className="visually-hidden">Histórico fictício de vendas. Use Abrir para consultar o detalhe; setas navegam entre os botões.</caption>
      <thead><tr>{['Ação', 'Número', 'Data / hora', 'Itens', 'Cliente / operador', 'Pagamento', 'Situação', 'Envio', 'Total'].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
      <tbody>{visible.map((sale, index) => <tr key={sale.id} className={selected?.id === sale.id ? 'sale-row is-selected' : 'sale-row'} onClick={() => setSelectedId(sale.id)} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest('button')) navigate(sale.id) }} onKeyDown={(event) => moveRow(event, index)}>
        <td><button id={'open-' + sale.id} className="sale-open" aria-label={'Abrir venda ' + sale.number} onFocus={() => setSelectedId(sale.id)} onClick={() => navigate(sale.id)}>Abrir {selected?.id === sale.id && <kbd>F2</kbd>}</button></td>
        <td className="sale-number">{sale.number}</td>
        <td className="sale-date">{dateLabel(sale.date)}<small>{sale.time} · Caixa #{sale.cashSession}</small></td>
        <td className="sale-items">{sale.items.map((item) => <span key={item.name}><b>{item.quantity}×</b> {item.name}</span>)}</td>
        <td>{sale.customer || <span className="muted">Sem cliente</span>}<small>{sale.operator}</small></td>
        <td><span className={'payment-badge payment-' + sale.payment}><PaymentIcon method={sale.payment} />{sale.payment}</span></td>
        <td><span className={sale.status === 'Cancelada' ? 'sale-status cancelled' : 'sale-status'}>{sale.status}</span></td>
        <td><span className={'sync-badge ' + (sale.sync === 'Pendente' ? 'pending' : 'received')}>{sale.sync}</span></td>
        <td className="sale-total">{money(totalCents(sale))}</td>
      </tr>)}</tbody></table></div>}

    <footer className="sales-list-footer">
      <p>{scenario === 'normal' && visible.length > 0 ? <>Exibindo {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}</> : '—'}</p>
      <div className="sales-pagination" aria-label="Paginação"><button className="sales-secondary" disabled={currentPage === 1 || scenario !== 'normal'} onClick={() => changePage(currentPage - 1)}>Anterior</button><span>Página {currentPage} de {pageCount}</span><button className="sales-secondary" disabled={currentPage === pageCount || scenario !== 'normal'} onClick={() => changePage(currentPage + 1)}>Próxima</button></div>
    </footer>
    {scenario === 'normal' && <p className="sales-summary">Total das vendas concluídas no filtro: <strong>{money(completed.reduce((sum, sale) => sum + totalCents(sale), 0))}</strong><span>Canceladas não compõem este total.</span></p>}
    <details className="demo-controls"><summary>Cenários de demonstração</summary><div><p>Dados apenas em memória; os estados de envio também são fictícios.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Simular carregamento</button><button className="sales-secondary" onClick={() => setScenario('error')}>Simular falha</button></div></details>

    {overlay && <SaleDetail key={routePart} sale={preview} onClose={closeOverlay} onCancel={onCancel} onPrint={onPrint} />}
  </section>
}

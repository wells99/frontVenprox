import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { dateLabel, demoSales, money, normalize, totalCents } from './demoSales'
import type { Sale } from './demoSales'
import './sales.css'

type Props = { active: boolean; route: string }
const pageSize = 8

export function SalesHistory({ active, route }: Props) {
  const [query, setQuery] = useState('')
  const [payment, setPayment] = useState('')
  const [status, setStatus] = useState('')
  const [sync, setSync] = useState('')
  const [session, setSession] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(demoSales[0].id)
  const [scenario, setScenario] = useState<'normal' | 'loading' | 'error'>('normal')
  const searchRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openedHere = useRef(false)
  const invalidRange = Boolean(from && to && from > to)
  const hasFilters = Boolean(query || payment || status || sync || session || from || to)
  const filtered = demoSales.filter((sale) => {
    const text = normalize([sale.number, sale.customer, sale.operator, ...sale.items.map((item) => item.name)].join(' '))
    return !invalidRange && text.includes(normalize(query.trim())) && (!payment || sale.payment === payment) && (!status || sale.status === status) && (!sync || sale.sync === sync) && (!session || String(sale.cashSession) === session) && (!from || sale.date >= from) && (!to || sale.date <= to)
  }).sort((a, b) => sort === 'value' ? totalCents(b) - totalCents(a) || b.number - a.number : sort === 'old' ? a.number - b.number : b.number - a.number)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selected = visible.find((sale) => sale.id === selectedId) ?? visible[0]
  const routePart = route.split('/')[2]
  const isNew = routePart === 'nova'
  const preview = demoSales.find((sale) => sale.id === routePart)
  const overlay = active && Boolean(routePart)
  const completed = filtered.filter((sale) => sale.status === 'Concluída')

  function navigate(destination: string) {
    openedHere.current = true
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
    if (scenario !== 'loading') return
    const timer = window.setTimeout(() => setScenario('normal'), 900)
    return () => window.clearTimeout(timer)
  }, [scenario])

  useEffect(() => {
    const dialog = dialogRef.current
    if (overlay && dialog && !dialog.open) dialog.showModal()
    else if (!overlay && dialog?.open) dialog.close()
  }, [overlay])

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
      <h1 id="sales-title">Vendas</h1>
      <span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span>
    </header>
    <div className="sales-actions">
      <button className="sales-primary" onClick={() => navigate('nova')}><span aria-hidden="true">＋</span> Nova Venda <kbd>F3</kbd></button>
      <p>Consulte e acompanhe o histórico de vendas.</p>
    </div>
    <div className="sales-tabs"><span aria-current="page">Histórico</span></div>

    <form className="sales-filters" aria-label="Filtros do histórico" onSubmit={(event) => event.preventDefault()}>
      <label className="sales-search">Buscar venda
        <span className="search-field"><span aria-hidden="true">⌕</span><input ref={searchRef} type="search" placeholder="Número, produto, cliente ou operador" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></span>
      </label>
      <label>Caixa<select aria-label="Caixa" value={session} onChange={(event) => { setSession(event.target.value); setPage(1) }}><option value="">Todos os caixas</option><option value="26">Caixa #26</option><option value="25">Caixa #25</option></select></label>
      <label>Pagamento<select aria-label="Pagamento" value={payment} onChange={(event) => { setPayment(event.target.value); setPage(1) }}><option value="">Todos os meios</option>{['Dinheiro', 'Pix', 'Crédito', 'Débito'].map((value) => <option key={value}>{value}</option>)}</select></label>
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
    : !visible.length ? <div className="sales-empty"><span className="empty-symbol" aria-hidden="true">⌕</span><h2>Nenhuma venda encontrada</h2><p>{invalidRange ? 'Ajuste o intervalo de datas para consultar o histórico.' : 'Experimente outro termo ou ajuste os filtros da busca.'}</p><button className="sales-secondary" onClick={clearFilters}>Limpar filtros</button></div>
    : <div className="sales-table-scroll"><table className="sales-table"><caption className="visually-hidden">Histórico fictício de vendas. Use Abrir para consultar uma prévia; setas navegam entre os botões.</caption>
      <thead><tr>{['Ação', 'Número', 'Data / hora', 'Itens', 'Cliente / operador', 'Pagamento', 'Situação', 'Envio', 'Total'].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
      <tbody>{visible.map((sale, index) => <tr key={sale.id} className={selected?.id === sale.id ? 'sale-row is-selected' : 'sale-row'} onClick={() => setSelectedId(sale.id)} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest('button')) navigate(sale.id) }} onKeyDown={(event) => moveRow(event, index)}>
        <td><button id={'open-' + sale.id} className="sale-open" aria-label={'Abrir venda ' + sale.number} onFocus={() => setSelectedId(sale.id)} onClick={() => navigate(sale.id)}>Abrir {selected?.id === sale.id && <kbd>F2</kbd>}</button></td>
        <td className="sale-number">{sale.number}</td>
        <td className="sale-date">{dateLabel(sale.date)}<small>{sale.time} · Caixa #{sale.cashSession}</small></td>
        <td className="sale-items">{sale.items.map((item) => <span key={item.name}><b>{item.quantity}×</b> {item.name}</span>)}</td>
        <td>{sale.customer || <span className="muted">Sem cliente</span>}<small>{sale.operator}</small></td>
        <td><span className={'payment-badge payment-' + sale.payment}><span aria-hidden="true">{sale.payment === 'Dinheiro' ? '▱' : sale.payment === 'Pix' ? '◇' : '▭'}</span>{sale.payment}</span></td>
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

    <dialog ref={dialogRef} className="sales-dialog" aria-labelledby="sale-dialog-title" onCancel={(event) => { event.preventDefault(); closeOverlay() }}>
      <div className="sale-dialog-heading"><div><span className="dialog-eyebrow">Demonstração</span><h2 id="sale-dialog-title">{isNew ? 'Nova venda' : preview ? 'Venda #' + preview.number : 'Venda não encontrada'}</h2></div><button className="dialog-close" aria-label="Fechar prévia" onClick={closeOverlay}>×</button></div>
      {isNew ? <div className="sale-dialog-body"><p>Este é o ponto de entrada para iniciar uma venda.</p><p>A montagem dos itens e o pagamento serão construídos nas próximas telas. Nenhuma venda foi criada.</p></div>
      : preview ? <SalePreview sale={preview} /> : <div className="sale-dialog-body"><p>Este registro não existe na lista de demonstração.</p></div>}
      <footer><button className="sales-primary" onClick={closeOverlay}>Voltar ao histórico</button></footer>
    </dialog>
  </section>
}

function SalePreview({ sale }: { sale: Sale }) {
  return <div className="sale-dialog-body"><p className="preview-meta">{dateLabel(sale.date)} às {sale.time} · Caixa #{sale.cashSession} · {sale.status}</p><ul className="preview-items">{sale.items.map((item) => <li key={item.name}><span>{item.quantity}× {item.name}</span><strong>{money(item.priceCents * item.quantity)}</strong></li>)}</ul><dl className="preview-facts"><div><dt>Cliente</dt><dd>{sale.customer || 'Não informado'}</dd></div><div><dt>Operador</dt><dd>{sale.operator}</dd></div><div><dt>Meio informado</dt><dd>{sale.payment}</dd></div><div><dt>Envio simulado</dt><dd>{sale.sync}</dd></div></dl><div className="preview-total"><span>Total</span><strong>{money(totalCents(sale))}</strong></div><p className="preview-note">Prévia de consulta. Cancelamento, comprovante e detalhe completo serão implementados na T05.</p></div>
}

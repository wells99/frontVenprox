import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../../ui/AppIcon'
import { money, normalize } from '../sales/demoSales'
import { recurrenceText, reminderStatus, reminderWhen } from './reminderDemo'
import type { ReminderOccurrence, ReminderState } from './reminderDemo'
import '../products/products.css'
import './bills.css'
export type ReminderEditorMode = 'edit' | 'postpone'
type Props = { active: boolean; route: string; state: ReminderState; now: string; blocked: boolean; reveal?: { id: string; version: number }; onAction: (kind: 'resolve' | 'stop', occurrence: ReminderOccurrence) => void; onEdit?: (occurrence?: ReminderOccurrence, mode?: ReminderEditorMode) => void }
const tabs = [{ id: 'upcoming', label: 'Próximas' }, { id: 'overdue', label: 'Vencidas' }, { id: 'resolved', label: 'Resolvidas' }]
export function BillsPage({ active, route, state, now, blocked, reveal, onAction, onEdit }: Props) {
  const [tab, setTab] = useState('upcoming')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [scenario, setScenario] = useState('normal')
  const appliedRoute = useRef('')
  const appliedReveal = useRef(0)
  const search = useRef<HTMLInputElement>(null)
  const source = scenario === 'empty' ? [] : state.occurrences
  const filtered = source.filter((item) => reminderStatus(item, now) === tab && normalize(item.description).includes(normalize(query.trim()))).sort((a,b) => tab === 'resolved' ? (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? '') : a.dueAt.localeCompare(b.dueAt) || a.id.localeCompare(b.id))
  const pages = Math.max(1, Math.ceil(filtered.length / 6))
  const currentPage = Math.min(page,pages)
  const visible = filtered.slice((currentPage - 1) * 6, currentPage * 6)
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0]
  useEffect(() => { if (active && !blocked) search.current?.focus() }, [active, blocked])
  useEffect(() => { if (scenario !== 'loading') return; const timer = setTimeout(() => setScenario('normal'),650); return () => clearTimeout(timer) }, [scenario])
  useEffect(() => {
    if (!active) return
    const freshReveal = reveal && reveal.version !== appliedReveal.current
    const id = freshReveal ? reveal.id : appliedRoute.current !== route && route.startsWith('/contas-a-pagar/ocorrencia/') ? route.split('/')[3] : undefined
    if (!id) { appliedRoute.current = route; return }
    const item = state.occurrences.find((item) => item.id === id)
    if (!item) return
    const frame = requestAnimationFrame(() => {
      appliedRoute.current = route; appliedReveal.current = reveal?.version ?? appliedReveal.current
      setTab(reminderStatus(item,now)); setQuery(''); setSelectedId(item.id); setScenario('normal')
      const list = state.occurrences.filter((entry) => reminderStatus(entry,now) === reminderStatus(item,now)).sort((a,b) => reminderStatus(item,now) === 'resolved' ? (b.resolvedAt ?? '').localeCompare(a.resolvedAt ?? '') : a.dueAt.localeCompare(b.dueAt) || a.id.localeCompare(b.id))
      setPage(Math.floor(list.findIndex((entry) => entry.id === item.id) / 6) + 1)
      requestAnimationFrame(() => document.getElementById('reminder-' + item.id)?.focus())
    })
    return () => cancelAnimationFrame(frame)
  }, [active, route, state.occurrences, now, reveal])
  useEffect(() => {
    if (!active || blocked || scenario !== 'normal' || !selected) return
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('dialog')) return
      if (event.key === 'F2' && selected.status === 'pending' && onEdit) { event.preventDefault(); if (!event.repeat) onEdit(selected); return }
      if (target?.closest('select, textarea, [contenteditable=true]') || target?.matches('input') && target !== search.current || !['ArrowDown','ArrowUp'].includes(event.key)) return
      event.preventDefault()
      const index = visible.findIndex((item) => item.id === selected.id)
      const next = visible[Math.max(0, Math.min(visible.length - 1,index + (event.key === 'ArrowDown' ? 1 : -1)))]
      setSelectedId(next.id); document.getElementById('reminder-' + next.id)?.focus()
    }
    window.addEventListener('keydown',key); return () => window.removeEventListener('keydown',key)
  }, [active, blocked, scenario, selected, visible, onEdit])
  return <section className="products-page bills-page" hidden={!active} aria-labelledby="bills-title"><header className="sales-header"><h1 id="bills-title" tabIndex={-1}>Contas a Pagar</h1><span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span></header><div className="products-intro"><p>Sua agenda de lembretes. Resolver uma conta não movimenta o caixa.</p>{onEdit ? <button className="sales-primary" onClick={() => onEdit()}><AppIcon name="add" size={16} />Nova conta para lembrar</button> : <button className="sales-secondary" disabled>Cadastro · próxima etapa</button>}</div>
    <div className="bills-tabs" role="group" aria-label="Situação dos lembretes">{tabs.map((item) => <button className="sales-secondary" key={item.id} aria-pressed={tab === item.id} onClick={() => { setTab(item.id); setPage(1) }}>{item.label} <span>({source.filter((entry) => reminderStatus(entry,now) === item.id).length})</span></button>)}</div>
    <div className="products-filters"><label className="products-search">Buscar lembrete<span><AppIcon name="search" size={18} /><input ref={search} type="search" placeholder="Descrição da conta" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></span></label>{query && <button className="sales-text-button" onClick={() => { setQuery(''); setPage(1) }}>Limpar busca</button>}<p className="bills-zone">Horários da loja · Brasília</p></div>
    {scenario === 'loading' ? <div className="products-empty" role="status"><h2>Carregando lembretes…</h2><p>Os filtros são preservados.</p></div> : scenario === 'error' ? <div className="products-empty" role="alert"><h2>Não foi possível consultar a agenda</h2><p>Falha simulada. Nenhuma conta foi alterada.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Tentar novamente</button></div> : !filtered.length ? <div className="products-empty"><AppIcon name="bills" size={30} /><h2>{query ? 'Nenhum lembrete encontrado' : tab === 'overdue' ? 'Nenhum lembrete vencido' : tab === 'resolved' ? 'Nenhuma ocorrência resolvida' : 'Nenhum lembrete próximo'}</h2><p>{query ? 'Revise a descrição ou consulte outra situação.' : 'Use Nova conta para lembrar para organizar sua agenda. Os lembretes não registram pagamentos.'}</p>{scenario === 'empty' && <button className="sales-secondary" onClick={() => setScenario('normal')}>Restaurar agenda de demonstração</button>}</div> : <><div className="products-table-scroll" role="region" aria-label="Agenda de contas" tabIndex={0}><table className="products-table bills-table"><caption className="visually-hidden">Um clique seleciona; ↑/↓ navegam. Dois cliques ou F2 editam ocorrências pendentes.</caption><thead><tr><th>Descrição</th><th>Data e hora</th><th>Valor informativo</th><th>Recorrência</th><th>Ações</th></tr></thead><tbody>{visible.map((item) => { const rule = state.rules.find((rule) => rule.id === item.ruleId); return <tr key={item.id} className={selected?.id === item.id ? 'is-selected' : ''} onClick={() => { setSelectedId(item.id); document.getElementById('reminder-' + item.id)?.focus() }} onDoubleClick={(event) => { if (!(event.target instanceof HTMLElement && event.target.closest('.bills-actions')) && item.status === 'pending') onEdit?.(item) }}><td><button id={'reminder-' + item.id} className="product-select" aria-pressed={selected?.id === item.id} onFocus={() => setSelectedId(item.id)}>{item.description}</button><small>{item.status === 'resolved' ? 'Resolvida · sem baixa financeira' : tab === 'overdue' ? 'Vencida' : 'Próxima'}</small></td><td>{reminderWhen(item.dueAt)}{item.dueAt !== item.scheduledAt && <small>Original: {reminderWhen(item.scheduledAt)}</small>}{item.resolvedAt && <small>Resolvida em {reminderWhen(item.resolvedAt)}</small>}</td><td>{money(item.amountCents)}</td><td>{recurrenceText(rule)}</td><td><div className="bills-actions">{item.status === 'pending' && <>{onEdit && <><button className="sales-secondary" aria-label={'Editar ' + item.description} onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); onEdit(item,'edit') }}>Editar</button><button className="sales-secondary" aria-label={'Adiar ' + item.description} onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); onEdit(item,'postpone') }}>Adiar</button></>}<button className="sales-secondary" aria-label={'Resolver ' + item.description} onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); onAction('resolve',item) }}>Resolver</button></>}{rule?.active && rule.frequency !== 'once' && <button className="sales-text-button" aria-label={'Interromper série de ' + item.description} onClick={(event) => { event.stopPropagation(); onAction('stop',item) }}>Interromper série</button>}</div></td></tr> })}</tbody></table></div><div className="products-pagination"><p>{filtered.length} {filtered.length === 1 ? 'ocorrência' : 'ocorrências'}</p><nav aria-label="Paginação da agenda"><button className="sales-secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>Página {currentPage} de {pages}</span><button className="sales-secondary" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Próxima</button></nav></div></>}
    <p className="products-footnote">Uma ocorrência pendente por série; resolver gera a próxima data, que pode estar vencida. Atrasos não são descartados. Interromper preserva a ocorrência atual e o histórico.</p><p className="products-footnote">Dados em memória. Recarregar restaura os exemplos. Avisos somente com esta demonstração aberta, sem envio real ou notificação com o programa encerrado.</p><details className="demo-controls"><summary>Cenários da agenda</summary><div><button className="sales-secondary" onClick={() => setScenario('loading')}>Simular carregamento</button><button className="sales-secondary" onClick={() => setScenario('error')}>Simular falha de consulta</button><button className="sales-secondary" onClick={() => setScenario(scenario === 'empty' ? 'normal' : 'empty')}>{scenario === 'empty' ? 'Restaurar agenda' : 'Simular agenda vazia'}</button></div></details>
  </section>
}

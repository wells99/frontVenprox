import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../../ui/AppIcon'
import { money, normalize } from '../sales/demoSales'
import type { Customer } from './customerDemo'
import '../products/products.css'
import './customers.css'
type Props = { active: boolean; customers: Customer[]; selecting: boolean; onSelect: (id: string | null) => void; onEdit?: (customer: Customer | 'new') => void; onCredit?: (customer: Customer) => void; balanceOf?: (id: string) => number; blocked?: boolean }
export function CustomersPage({ active, customers, selecting, onSelect, onEdit, onCredit, balanceOf, blocked = false }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const [page, setPage] = useState(1)
  const [scenario, setScenario] = useState('normal')
  const search = useRef<HTMLInputElement>(null)
  const source = scenario === 'empty' ? [] : customers
  const filtered = source.filter((item) => normalize(item.name + ' ' + item.contact).includes(normalize(query.trim())) && (selecting ? item.active : status === 'all' || item.active === (status === 'active'))).sort((a,b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id))
  const pages = Math.max(1, Math.ceil(filtered.length / 8))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8)
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0]
  useEffect(() => { if (active && !blocked) search.current?.focus() }, [active, selecting, blocked])
  useEffect(() => { if (scenario !== 'loading') return; const timer = setTimeout(() => setScenario('normal'), 650); return () => clearTimeout(timer) }, [scenario])
  useEffect(() => {
    if (!active || blocked || scenario !== 'normal' || !selected) return
    function key(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('dialog')) return
      if (event.key === 'F2' || (selecting && event.key === 'Enter')) {
        event.preventDefault()
        if (!event.repeat) { if (selecting) onSelect(selected.id); else onEdit?.(selected) }
        return
      }
      if (target?.closest('select, textarea, [contenteditable=true]') || (target?.matches('input') && target !== search.current)) return
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
      event.preventDefault()
      const index = visible.findIndex((item) => item.id === selected.id)
      const next = visible[Math.max(0, Math.min(visible.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
      setSelectedId(next.id)
      document.getElementById('customer-' + next.id)?.focus()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [active, blocked, scenario, selected, visible, selecting, onSelect, onEdit])
  return <section className="products-page customers-page" hidden={!active} aria-labelledby="customers-title">
    <header className="sales-header"><h1 id="customers-title">{selecting ? 'Escolher cliente' : 'Clientes'} <span>({customers.length})</span></h1><span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span></header>
    <div className="products-intro"><p>{selecting ? 'Escolha um cliente ativo para a venda em andamento. O rascunho será mantido.' : 'Cadastre clientes e acompanhe as anotações de fiado.'}</p>{onEdit ? <button className="sales-primary" onClick={() => onEdit('new')}><AppIcon name="add" size={16} />Adicionar cliente</button> : <button className="sales-secondary" disabled>Cadastro · próxima etapa</button>}</div>
    {selecting && <div className="customer-selection-banner"><button className="sales-secondary" onClick={() => { window.location.hash = '/vendas/nova' }}>Voltar sem alterar cliente</button><button className="sales-text-button" onClick={() => onSelect(null)}>Continuar sem cliente</button></div>}
    <div className="products-filters"><label className="products-search">Buscar cliente<span><AppIcon name="search" size={18} /><input ref={search} type="search" placeholder="Nome ou contato" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></span></label>{!selecting && <label>Situação<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="all">Todos os clientes</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>}{(query || status !== 'all') && <button className="sales-text-button" onClick={() => { setQuery(''); setStatus('all'); setPage(1); search.current?.focus() }}>Limpar filtros</button>}</div>
    {scenario === 'loading' ? <div className="products-empty" role="status"><h2>Carregando clientes…</h2><p>Consulta simulada. Os filtros são mantidos.</p></div> : scenario === 'error' ? <div className="products-empty" role="alert"><h2>Não foi possível consultar os clientes</h2><p>Falha simulada. Seus filtros foram preservados.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Tentar novamente</button></div> : !filtered.length ? <div className="products-empty"><AppIcon name="customers" size={32} /><h2>{source.length ? 'Nenhum cliente encontrado' : 'Sua lista de clientes está vazia'}</h2><p>{source.length ? 'Revise a busca e a situação para encontrar outros clientes.' : 'Use Adicionar cliente para começar. Nome é o único dado obrigatório; a venda comum também pode seguir sem cliente.'}</p>{scenario === 'empty' && <button className="sales-secondary" onClick={() => setScenario('normal')}>Restaurar clientes de demonstração</button>}</div> : <>
      <p className="products-footnote" role="status">{filtered.length} {filtered.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}</p>
      <div className="products-table-scroll" role="region" aria-label="Lista de clientes" tabIndex={0}><table className="products-table customers-table"><caption className="visually-hidden">Um clique seleciona; setas para cima e para baixo navegam. {selecting ? 'Dois cliques, Enter ou F2 escolhem o cliente para a venda.' : 'Dois cliques ou F2 editam o cliente.'}</caption><thead><tr><th>Nome</th><th>Contato</th>{balanceOf && <th>Dívida de fiado</th>}<th>Situação</th><th>Ações</th></tr></thead><tbody>{visible.map((customer) => <tr key={customer.id} className={selected?.id === customer.id ? 'is-selected' : ''} onClick={() => { setSelectedId(customer.id); document.getElementById('customer-' + customer.id)?.focus() }} onDoubleClick={() => { if (selecting) onSelect(customer.id); else onEdit?.(customer) }}><td><button id={'customer-' + customer.id} className="product-select" aria-pressed={selected?.id === customer.id} onFocus={() => setSelectedId(customer.id)}>{customer.name}</button><small>Identificador: {customer.id.slice(0,8)}</small></td><td>{customer.contact || 'Não informado'}</td>{balanceOf && <td>{money(balanceOf(customer.id))}</td>}<td><span className={'product-state ' + (customer.active ? 'is-active' : '')}>{customer.active ? 'Ativo' : 'Inativo'}</span></td><td><div className="customer-row-actions">{selecting ? <button className="sales-secondary" onClick={(event) => { event.stopPropagation(); onSelect(customer.id) }}>Escolher</button> : <>{onEdit && <button className="sales-secondary" aria-label={'Editar ' + customer.name} onClick={(event) => { event.stopPropagation(); setSelectedId(customer.id); onEdit(customer) }}>Editar</button>}{onCredit && <button className="sales-secondary" aria-label={'Fiado de ' + customer.name} onClick={(event) => { event.stopPropagation(); setSelectedId(customer.id); onCredit(customer) }}>Fiado</button>}</>}</div></td></tr>)}</tbody></table></div>
      <div className="products-pagination"><p>Exibindo {(currentPage - 1) * 8 + 1}–{Math.min(currentPage * 8, filtered.length)} de {filtered.length}</p><nav aria-label="Paginação de clientes"><button className="sales-secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>Página {currentPage} de {pages}</span><button className="sales-secondary" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Próxima</button></nav></div>
      {selected && <p className="products-footnote">Selecionado: {selected.name}. {selecting ? 'Dois cliques, Enter ou F2 escolhem para a venda.' : '↑/↓ selecionam; dois cliques ou F2 editam.'}</p>}
    </>}
    <p className="products-footnote">Dados fictícios apenas em memória. Nenhum documento é obrigatório. Recarregar restaura a demonstração.</p>
    <details className="demo-controls"><summary>Cenários de consulta de clientes</summary><div><button className="sales-secondary" onClick={() => setScenario('loading')}>Simular carregamento</button><button className="sales-secondary" onClick={() => setScenario('error')}>Simular falha</button><button className="sales-secondary" onClick={() => setScenario(scenario === 'empty' ? 'normal' : 'empty')}>{scenario === 'empty' ? 'Restaurar clientes' : 'Simular lista vazia'}</button></div></details>
  </section>
}

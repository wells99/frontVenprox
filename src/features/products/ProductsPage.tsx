import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../../ui/AppIcon'
import { money, normalize } from '../sales/demoSales'
import type { CatalogProduct } from './productDemo'
import { CategoryPanel } from './CategoryPanel'
import type { Category, SaveCategory } from './CategoryPanel'
import { ProductEditor } from './ProductEditor'
import './products.css'

const pageSize = 6
type Scenario = 'normal' | 'loading' | 'error' | 'empty'

export function ProductsPage({ active, products, categories, onCategorySave, onSave }: { active: boolean; products: CatalogProduct[]; categories: Category[]; onCategorySave: SaveCategory; onSave: (product: CatalogProduct) => string | undefined }) {
  const [categoryPanel, setCategoryPanel] = useState(false)
  const categoryFocus = useRef<HTMLElement | null>(null)
  const productCategories = categories.map((item) => item.name)
  const [editor, setEditor] = useState<CatalogProduct | 'new' | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  function openEditor(product: CatalogProduct | 'new') { returnFocus.current = document.activeElement as HTMLElement; setEditor(product) }
  function closeEditor() { setEditor(null); requestAnimationFrame(() => returnFocus.current?.focus()) }
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [scenario, setScenario] = useState<Scenario>('normal')
  const [notice, setNotice] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const source = scenario === 'empty' ? [] : products
  const matching = source.filter((product) => normalize([product.name, product.code, product.barcode].join(' ')).includes(normalize(query.trim())) && (status === 'all' || product.active === (status === 'active')))
  const filtered = matching.filter((product) => category === 'all' || (category === 'none' ? !product.category : product.category === category)).sort((a, b) => (sort === 'price' ? a.priceCents - b.priceCents : sort === 'stock' ? a.stock - b.stock : a.name.localeCompare(b.name, 'pt-BR')) || a.name.localeCompare(b.name, 'pt-BR'))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selected = visible.find((product) => product.id === selectedId) ?? visible[0]
  const hasFilters = Boolean(query || category !== 'all' || status !== 'all')
  useEffect(() => { if (active) searchRef.current?.focus() }, [active])
  useEffect(() => {
    if (scenario !== 'loading') return
    const timer = window.setTimeout(() => setScenario('normal'), 750)
    return () => window.clearTimeout(timer)
  }, [scenario])
  useEffect(() => {
    if (!active || editor || categoryPanel || scenario !== 'normal') return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || !selected) return
      if (event.key === 'F2') {
        event.preventDefault()
        if (!event.repeat) openEditor(selected)
        return
      }
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('dialog, select, textarea, [contenteditable=true]') || (target?.matches('input') && target !== searchRef.current)) return
      const inTable = Boolean(target?.closest('.products-table-scroll'))
      if (!['ArrowDown', 'ArrowUp'].includes(event.key) && !(inTable && ['Home', 'End'].includes(event.key))) return
      event.preventDefault()
      const index = visible.findIndex((product) => product.id === selected.id)
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : Math.max(0, Math.min(visible.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))
      const next = visible[nextIndex]
      setSelectedId(next.id)
      setNotice('')
      document.getElementById('select-product-' + next.id)?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, scenario, selected, editor, categoryPanel, visible])
  function clearFilters() { setQuery(''); setCategory('all'); setStatus('all'); setPage(1); setNotice(''); searchRef.current?.focus() }
  return <section className="products-page" hidden={!active} aria-labelledby="products-title">
    <header className="sales-header"><h1 id="products-title">Produtos <span>({source.length})</span></h1><span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span></header>
    <div className="products-intro"><p>Consulte preços, categorias e saldos do catálogo.</p><button className="sales-primary" onClick={() => openEditor('new')}><AppIcon name="add" size={16} />Adicionar produto</button></div>
    <form className="products-filters" aria-label="Filtros dos produtos" onSubmit={(event) => event.preventDefault()}>
      <label className="products-search">Buscar produto<span><AppIcon name="search" size={18} /><input ref={searchRef} type="search" placeholder="Nome, código ou código de barras" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); setNotice('') }} /></span></label>
      <label>Situação<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); setNotice('') }}><option value="all">Todos os produtos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>
      {hasFilters && <button type="button" className="sales-text-button" onClick={clearFilters}>Limpar filtros</button>}
    </form>
    <div className="products-layout">
      <aside className="products-categories" aria-label="Categorias de produtos"><h2>Categorias</h2><div>{[{ value: 'all', label: 'Todos', count: matching.length }, { value: 'none', label: 'Sem categoria', count: matching.filter((product) => !product.category).length }, ...productCategories.map((name) => ({ value: name, label: name, count: matching.filter((product) => product.category === name).length }))].map((item) => <button key={item.value} type="button" aria-pressed={category === item.value} onClick={() => { setCategory(item.value); setPage(1); setNotice('') }}><span>{item.label}</span><small>{item.count}</small></button>)}</div><button className="sales-secondary" onClick={() => { categoryFocus.current = document.activeElement as HTMLElement; setCategoryPanel(true) }}>Gerenciar categorias</button></aside>
      <div className="products-results" aria-busy={scenario === 'loading'}>
        <div className="products-toolbar"><p role="status">{scenario === 'error' ? 'Consulta indisponível' : scenario === 'loading' ? 'Carregando produtos…' : filtered.length + (filtered.length === 1 ? ' produto encontrado' : ' produtos encontrados')}</p><label>Ordenar por<select value={sort} disabled={scenario === 'loading' || scenario === 'error'} onChange={(event) => { setSort(event.target.value); setPage(1); setNotice('') }}><option value="name">Nome (A–Z)</option><option value="price">Menor preço</option><option value="stock">Menor saldo</option></select></label></div>
        {scenario === 'loading' ? <div className="products-empty" role="status"><AppIcon name="products" size={30} /><h2>Carregando produtos…</h2><p>Consulta simulada. A busca e os filtros serão mantidos.</p></div>
        : scenario === 'error' ? <div className="products-empty" role="alert"><h2>Não foi possível consultar os produtos</h2><p>Falha simulada. Seus filtros e a seleção foram mantidos.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Tentar novamente</button></div>
        : !filtered.length ? <div className="products-empty"><AppIcon name={source.length ? 'search' : 'products'} size={30} /><h2>{source.length ? 'Nenhum produto encontrado' : 'Seu catálogo está vazio'}</h2><p>{source.length ? 'Ajuste a busca, a categoria ou a situação para encontrar outros produtos.' : 'Os produtos aparecerão aqui após o cadastro. Use Adicionar produto para cadastrar.'}</p>{source.length ? <button className="sales-secondary" onClick={clearFilters}>Limpar filtros</button> : <button className="sales-secondary" onClick={() => setScenario('normal')}>Restaurar catálogo de demonstração</button>}</div>
        : <><div className="products-table-scroll" role="region" aria-label="Lista de produtos" tabIndex={0}><table className="products-table"><caption className="visually-hidden">Produtos fictícios. Selecione um produto; use as setas para percorrer a página. Dois cliques ou F2 abrem a edição.</caption><thead><tr><th scope="col">Produto / código</th><th scope="col">Categoria</th><th scope="col">Preço</th><th scope="col">Saldo</th><th scope="col">Situação</th></tr></thead><tbody>{visible.map((product) => <tr key={product.id} className={selected?.id === product.id ? 'is-selected' : ''} onClick={() => { setSelectedId(product.id); setNotice(''); document.getElementById('select-product-' + product.id)?.focus() }} onDoubleClick={() => { setSelectedId(product.id); openEditor(product) }}><td><button id={'select-product-' + product.id} className="product-select" aria-label={'Selecionar ' + product.name} aria-pressed={selected?.id === product.id} onFocus={() => { setSelectedId(product.id); setNotice('') }}>{product.name}</button><small>{product.code}</small></td><td>{product.category ?? 'Sem categoria'}</td><td className="product-price">{money(product.priceCents)}</td><td>{product.stock}<small>{product.unit}</small></td><td><span className={'product-state ' + (product.active ? 'is-active' : '')}>{product.active ? 'Ativo' : 'Inativo'}</span></td></tr>)}</tbody></table></div>
        <div className="products-pagination"><p>Exibindo {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}</p><nav aria-label="Paginação de produtos"><button className="sales-secondary" disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); setNotice('') }}>Anterior</button><span>Página {currentPage} de {pageCount}</span><button className="sales-secondary" disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); setNotice('') }}>Próxima</button></nav></div>
        {selected && <section className="product-selection" aria-label="Produto selecionado"><div><h2>{selected.name}</h2><p>Código de barras: {selected.barcode ?? 'Não informado'} · Custo: {selected.costCents === undefined ? 'Não informado' : money(selected.costCents)}</p></div><button className="sales-secondary" onClick={() => openEditor(selected)}>Editar · F2</button></section>}</>}
      </div>
    </div>
    {notice && <p className="products-notice" role="status">{notice}</p>}
    <p className="products-footnote" id="products-planned">↑/↓ selecionam um produto. Dois cliques na linha ou F2 abrem a edição. Os filtros são preservados ao voltar.</p>
    <p className="products-footnote">Dados fictícios em memória, sem gravação ou atualização de estoque real. Saldo zero ou negativo é consultável.</p>
    {active && categoryPanel && <CategoryPanel categories={categories} products={products} onSave={(value) => { const old = categories.find((item) => item.id === value.id); const error = onCategorySave(value); if (!error && old?.name === category) setCategory(value.name); return error }} onClose={() => { setCategoryPanel(false); requestAnimationFrame(() => categoryFocus.current?.focus()) }} />}
    {active && editor && <ProductEditor product={editor === 'new' ? undefined : editor} categories={categories} onCategorySave={onCategorySave} products={products} onClose={closeEditor} onSave={(product) => { const error = onSave(product); if (!error) { setScenario('normal'); setNotice('Produto salvo na demonstração. Dados apenas em memória.'); closeEditor() } return error }} />}
    <details className="demo-controls"><summary>Cenários de demonstração</summary><div><button className="sales-secondary" onClick={() => { setScenario('loading'); setNotice('') }}>Simular carregamento</button><button className="sales-secondary" onClick={() => { setScenario('error'); setNotice('') }}>Simular falha de consulta</button><button className="sales-secondary" onClick={() => { setScenario(scenario === 'empty' ? 'normal' : 'empty'); setNotice('') }}>{scenario === 'empty' ? 'Restaurar catálogo' : 'Simular catálogo vazio'}</button></div></details>
  </section>
}

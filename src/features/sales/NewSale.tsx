import { AppIcon } from '../../ui/AppIcon'
import { useEffect, useRef, useState } from 'react'
import { money, normalize } from './demoSales'
import type { Sale } from './demoSales'
import { catalog, parseMoney, subtotalOf, validateDraft } from './saleDraft'
import type { DraftItem, Product } from './saleDraft'
import { PaymentDialog } from './PaymentDialog'
import type { DemoPayment } from './PaymentDialog'
import { DemoDialog } from './DemoDialog'
import './checkout.css'

export function NewSale({ active, route, nextNumber, onComplete }: { active: boolean; route: string; nextNumber: number; onComplete: (sale: Sale) => void }) {
  const [items, setItems] = useState<DraftItem[]>([])
  const [query, setQuery] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [resultIndex, setResultIndex] = useState(0)
  const [discount, setDiscount] = useState('0,00')
  const [customer, setCustomer] = useState('')
  const [notes, setNotes] = useState('')
  const [requireStock, setRequireStock] = useState(false)
  const [cashOpen, setCashOpen] = useState(true)
  const [canDiscount, setCanDiscount] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<'manual' | 'discard' | 'cash' | undefined>(undefined)
  const [manualName, setManualName] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [manualError, setManualError] = useState('')
  const draftId = useRef(crypto.randomUUID())
  const searchRef = useRef<HTMLInputElement>(null)
  const quantityRef = useRef<HTMLInputElement>(null)
  const discountRef = useRef<HTMLInputElement>(null)
  const customerRef = useRef<HTMLSelectElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const paymentOpen = active && route === '/vendas/nova/pagamento'
  const results = catalog.filter((product) => normalize(product.name + ' ' + product.code).includes(normalize(query.trim())))
  const highlighted = Math.min(resultIndex, Math.max(0, results.length - 1))
  const subtotal = subtotalOf(items)
  const discountCents = parseMoney(discount) ?? 0
  const total = Math.max(0, subtotal - discountCents)
  const validation = items.length ? validateDraft(items, discount, requireStock) : undefined

  useEffect(() => { if (active && !paymentOpen && !dialog) searchRef.current?.focus() }, [active, paymentOpen, dialog])

  function addProduct(product: Product) {
    const count = Number(quantity)
    if (!Number.isInteger(count) || count < 1 || count > 999) { setError('Informe uma quantidade inteira entre 1 e 999.'); return }
    const existing = items.find((item) => item.productId === product.id)
    const newQuantity = (existing?.quantity ?? 0) + count
    if (newQuantity > 999) { setError('A quantidade máxima por item é 999.'); return }
    if (requireStock && newQuantity > Math.max(0, product.stock)) { setError('Estoque insuficiente para ' + product.name + '. Disponível: ' + Math.max(0, product.stock) + '.'); return }
    setItems(existing ? items.map((item) => item.id === existing.id ? { ...item, quantity: newQuantity } : item) : [...items, { id: crypto.randomUUID(), productId: product.id, name: product.name, quantity: count, priceCents: product.priceCents }])
    setQuery(''); setQuantity('1'); setResultIndex(0); setError(''); searchRef.current?.focus()
  }
  function startPayment() {
    const problem = validateDraft(items, discount, requireStock)
    if (problem) { setError(problem); return }
    if (!cashOpen) { setDialog('cash'); return }
    setError(''); window.location.hash = '/vendas/nova/pagamento'
  }
  function resetDraft() {
    setItems([]); setQuery(''); setQuantity('1'); setDiscount('0,00'); setCustomer(''); setNotes(''); setError(''); draftId.current = crypto.randomUUID()
  }
  function complete(payments: DemoPayment[]) {
    const now = new Date()
    const activePayments = payments.filter((payment) => payment.appliedCents > 0)
    const sale: Sale = {
      id: 'demo-new-' + draftId.current, number: nextNumber,
      date: [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items: items.map(({ name, quantity: qty, priceCents }) => ({ name, quantity: qty, priceCents })),
      discountCents, payment: activePayments.length > 1 ? 'Misto' : activePayments[0].method,
      payments, notes, customer, operator: 'Administrador exemplo', cashSession: 26, status: 'Concluída', sync: 'Pendente',
    }
    onComplete(sale); resetDraft(); window.location.assign('#/vendas')
  }
  function addManual() {
    const price = parseMoney(manualPrice)
    const count = Number(quantity)
    if (!manualName.trim() || price === undefined || price <= 0 || !Number.isInteger(count) || count < 1 || count > 999) { setManualError('Preencha descrição, preço maior que zero e quantidade inteira de 1 a 999.'); return }
    setItems([...items, { id: crypto.randomUUID(), name: manualName.trim(), priceCents: price, quantity: count }]); setDialog(undefined); setManualName(''); setManualPrice(''); setQuantity('1'); setError('')
  }
  useEffect(() => {
    if (!active || paymentOpen || dialog) return
    function onKey(event: KeyboardEvent) {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return
      if (event.key === 'F2') { event.preventDefault(); startPayment() }
      if (event.key === 'F3' && canDiscount) { event.preventDefault(); discountRef.current?.focus(); discountRef.current?.select() }
      if (event.key === 'F4') { event.preventDefault(); notesRef.current?.focus() }
      if (event.key === 'F5') { event.preventDefault(); customerRef.current?.focus() }
      if (event.key === 'F12') { event.preventDefault(); quantityRef.current?.focus(); quantityRef.current?.select() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return <section className="checkout-page" hidden={!active} aria-labelledby="new-sale-title">
    <div className="checkout-main">
      <header className="checkout-header"><h1 id="new-sale-title">Nova venda</h1><span className="demo-label">Demonstração · dados em memória</span><button className="sales-text-button" onClick={() => { window.location.hash = '/vendas' }}>Voltar ao histórico</button></header>
      <form className="product-search" onSubmit={(event) => { event.preventDefault(); if (results[highlighted]) addProduct(results[highlighted]) }}>
        <label>Buscar produto<input ref={searchRef} type="search" placeholder="Nome, código ou código de barras" value={query} onChange={(event) => { setQuery(event.target.value); setResultIndex(0) }} aria-controls="product-results" onKeyDown={(event) => {
          if (event.key === 'Enter') { event.preventDefault(); if (!event.repeat && results[highlighted]) addProduct(results[highlighted]) }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const next = Math.max(0, Math.min(results.length - 1, highlighted + (event.key === 'ArrowDown' ? 1 : -1)))
            setResultIndex(next)
            if (results[next]) document.getElementById('result-' + results[next].id)?.scrollIntoView({ block: 'nearest' })
          }
        }} /></label>
        <label className="top-quantity">Quantidade<input ref={quantityRef} type="number" min="1" max="999" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <button type="button" className="sales-secondary" disabled={requireStock} onClick={() => { setManualError(''); setDialog('manual') }}><AppIcon name="add" size={16} />Item avulso</button>
      </form>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <div className="catalog-panel" id="product-results" aria-label="Resultados de produtos">
        <div className="catalog-heading"><span>Produtos disponíveis na demonstração</span><small>Enter adiciona · ↑ ↓ selecionam</small></div>
        {!results.length ? <p className="catalog-empty">Nenhum produto encontrado. Use um item avulso no modo permissivo.</p> : <div className="catalog-list">{results.map((product, index) => <button id={'result-' + product.id} className={'catalog-result' + (index === highlighted ? ' highlighted' : '')} key={product.id} type="button" onClick={() => addProduct(product)} aria-label={'Adicionar ' + product.name}><span><strong>{product.name}</strong><small>{product.code}</small></span><span className="catalog-stock">Estoque: {product.stock}</span><b>{money(product.priceCents)}</b><AppIcon name="add" size={18} className="catalog-add" /></button>)}</div>}
      </div>
      <div className="cart-heading"><h2>Itens da venda <span>{items.length}</span></h2>{items.length > 0 && <button className="sales-text-button" onClick={() => setDialog('discard')}>Descartar rascunho</button>}</div>
      {!items.length ? <div className="cart-empty"><AppIcon name="cart" size={44} /><h3>Sua venda começa aqui</h3><p>Busque um produto ou adicione um item avulso.</p></div> : <div className="cart-scroll"><table className="cart-table"><caption className="visually-hidden">Itens do rascunho da venda</caption><thead><tr><th>Produto</th><th>Quantidade</th><th>Preço unitário</th><th>Total</th><th><span className="visually-hidden">Remover</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.name}</strong>{!item.productId && <small>Item avulso</small>}</td><td><input aria-label={'Quantidade de ' + item.name} type="number" min="1" max="999" value={item.quantity} onChange={(event) => { setItems(items.map((row) => row.id === item.id ? { ...row, quantity: Number(event.target.value) } : row)); setError('') }} /></td><td>{money(item.priceCents)}</td><td><b>{money(item.priceCents * item.quantity)}</b></td><td><button className="remove-item" aria-label={'Remover ' + item.name} onClick={() => { setItems(items.filter((row) => row.id !== item.id)); setError('') }}><AppIcon name="close" size={18} /></button></td></tr>)}</tbody></table></div>}
      <details className="demo-controls checkout-scenarios"><summary>Cenários de demonstração</summary><p>Rascunho e vendas simuladas somem ao recarregar. Não há persistência, caixa real ou cobrança.</p><label className="check-option"><input type="checkbox" checked={requireStock} onChange={(event) => { setRequireStock(event.target.checked); setError('') }} />Exigir estoque disponível</label><label className="check-option"><input type="checkbox" checked={cashOpen} onChange={(event) => setCashOpen(event.target.checked)} />Caixa aberto (simulação)</label><label className="check-option"><input type="checkbox" checked={canDiscount} onChange={(event) => { setCanDiscount(event.target.checked); if (!event.target.checked) setDiscount('0,00') }} />Permitir desconto (simulação)</label></details>
    </div>
    <aside className="checkout-summary" aria-label="Resumo da venda">
      <div className="draft-heading"><strong>{items.length} {items.length === 1 ? 'item' : 'itens'}</strong><span>{items.reduce((sum, item) => sum + item.quantity, 0)} unidades</span><small>Caixa #26 · {cashOpen ? 'aberto' : 'fechado'} na simulação</small></div>
      <label>Cliente opcional <kbd>F5</kbd><select ref={customerRef} value={customer} onChange={(event) => setCustomer(event.target.value)}><option value="">Sem cliente</option><option>Cliente demonstração</option><option>Cliente exemplo</option></select></label>
      <label>Observações <kbd>F4</kbd><textarea ref={notesRef} rows={3} maxLength={300} value={notes} placeholder="Adicionar uma observação" onChange={(event) => setNotes(event.target.value)} /></label>
      <label>Desconto em reais <kbd>F3</kbd><input ref={discountRef} inputMode="decimal" value={discount} disabled={!canDiscount} onFocus={(event) => event.target.select()} onChange={(event) => { setDiscount(event.target.value); setError('') }} /></label>
      {validation && <p className="checkout-error" role="status">{validation}</p>}
      <div className="draft-totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Desconto</span><span>− {money(discountCents)}</span></div><div className="draft-grand-total"><span>Total</span><strong>{money(total)}</strong></div></div>
      <button className="sales-primary checkout-conclude" disabled={!items.length} onClick={startPayment}>Concluir venda <kbd>F2</kbd></button>
      {items.length > 0 && <p className="draft-memory">Rascunho mantido ao navegar nesta sessão.</p>}
    </aside>
    {active && dialog === 'manual' && <DemoDialog title="Adicionar item avulso" onClose={() => setDialog(undefined)}><form onSubmit={(event) => { event.preventDefault(); addManual() }}><div className="sale-dialog-body checkout-form"><label>Descrição<input data-initial-focus maxLength={100} value={manualName} onChange={(event) => setManualName(event.target.value)} /></label><label>Preço unitário (R$)<input inputMode="decimal" value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} placeholder="0,00" /></label><p>Quantidade: {quantity}. Não exige cadastro nem gera baixa de um produto fictício.</p>{manualError && <p className="checkout-error" role="alert">{manualError}</p>}</div><footer><button className="sales-secondary" type="button" onClick={() => setDialog(undefined)}>Cancelar</button><button className="sales-primary" type="submit">Adicionar avulso</button></footer></form></DemoDialog>}
    {active && dialog === 'discard' && <DemoDialog title="Descartar rascunho?" onClose={() => setDialog(undefined)}><div className="sale-dialog-body"><p>Os itens, o desconto e os dados desta venda simulada serão removidos. Para manter, basta voltar ao histórico sem descartar.</p></div><footer><button className="sales-secondary" onClick={() => setDialog(undefined)}>Continuar venda</button><button className="sales-primary" onClick={() => { resetDraft(); setDialog(undefined) }}>Descartar rascunho</button></footer></DemoDialog>}
    {active && dialog === 'cash' && <DemoDialog title="Caixa fechado na simulação" onClose={() => setDialog(undefined)}><div className="sale-dialog-body"><p>A conclusão exige um caixa aberto com valor inicial informado. A tela de abertura T06 será implementada em sua etapa.</p><p>Para testar estas telas agora, escolha o cenário “Caixa aberto (simulação)”. O rascunho foi mantido.</p></div><footer><button className="sales-primary" onClick={() => setDialog(undefined)}>Voltar à venda</button></footer></DemoDialog>}
    {paymentOpen && items.length > 0 && !validation && cashOpen && <PaymentDialog total={total} onBack={() => { window.location.replace('#/vendas/nova') }} onConfirm={complete} />}
    {paymentOpen && (!items.length || validation || !cashOpen) && <DemoDialog title="Revise a venda" onClose={() => { window.location.replace('#/vendas/nova') }}><div className="sale-dialog-body"><p>{!items.length ? 'Não há rascunho disponível nesta sessão. Adicione os itens antes de conferir o pagamento.' : validation || 'O caixa está fechado na simulação.'}</p></div><footer><button className="sales-primary" onClick={() => { window.location.replace('#/vendas/nova') }}>Voltar à venda</button></footer></DemoDialog>}
  </section>
}

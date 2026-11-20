import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { moneyInput, parseMoney } from '../sales/saleDraft'
import type { CatalogProduct } from './productDemo'
import { quantityText, validateStockMovement } from './stockDemo'
import type { StockCommand, StockState } from './stockDemo'
import './editor.css'
import './stock.css'
export function StockMovementDialog({ state, initialProduct, onClose, onConfirm }: { state: StockState; initialProduct: CatalogProduct; onClose: () => void; onConfirm: (command: StockCommand) => string | undefined }) {
  const [product, setProduct] = useState(initialProduct)
  const [kind, setKind] = useState<'entry' | 'adjustment'>('entry')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [known, setKnown] = useState(initialProduct.costCents !== undefined)
  const [cost, setCost] = useState(initialProduct.costCents === undefined ? '' : moneyInput(initialProduct.costCents))
  const [authorized, setAuthorized] = useState(true)
  const [fail, setFail] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [id] = useState(() => crypto.randomUUID())
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  useEffect(() => () => clearTimeout(timer.current), [])
  const amount = /^-?\d{1,6}([,.]\d{1,3})?$/.test(quantity.trim()) ? Number(quantity.replace(',', '.')) : NaN
  const after = Number.isFinite(amount) ? Math.round((kind === 'entry' ? product.stock + amount : amount) * 1000) / 1000 : undefined
  function confirm() {
    if (lock.current) return
    const command: StockCommand = { id, productId: product.id, kind, quantity: amount, expectedStock: product.stock, costCents: known ? parseMoney(cost) : undefined, reason, authorized, at: new Date().toISOString() }
    const validation = known && command.costCents === undefined ? 'Informe um custo válido ou desmarque custo conhecido.' : validateStockMovement(state, command)
    if (validation) { setError(validation); if (!Number.isFinite(amount)) document.getElementById('stock-quantity')?.focus(); else if (!reason.trim()) document.getElementById('stock-reason')?.focus(); return }
    lock.current = true; setBusy(true); setError('')
    timer.current = window.setTimeout(() => {
      const message = fail ? 'Falha simulada. Nenhum movimento registrado. Os dados foram preservados para tentar novamente.' : onConfirm(command)
      if (message) { setError(message); lock.current = false; setBusy(false) }
    }, 500)
  }
  return <DemoDialog title="Entrada e ajuste de estoque" eyebrow="Estoque · demonstração em memória" onClose={onClose} locked={busy} className="catalog-dialog">
    <form noValidate onSubmit={(event) => { event.preventDefault(); confirm() }}>
      <fieldset className="editor-body" disabled={busy}>
        <label>Produto cadastrado<select data-initial-focus value={product.id} onChange={(event) => { const next = state.products.find((item) => item.id === event.target.value)!; setProduct(next); setQuantity(''); setKnown(next.costCents !== undefined); setCost(next.costCents === undefined ? '' : moneyInput(next.costCents)); setError('') }}>{state.products.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.code}{!item.active ? ' · Inativo' : ''}</option>)}</select></label>
        <p className="editor-hint">Unidade: {product.unit}. Saldo atual: {quantityText(product.stock)}.</p>
        <div className="editor-grid"><label>Tipo<select value={kind} onChange={(event) => { setKind(event.target.value as 'entry' | 'adjustment'); setQuantity(''); setError('') }}><option value="entry">Entrada · somar quantidade</option><option value="adjustment">Ajuste absoluto · definir saldo</option></select></label><label>{kind === 'entry' ? 'Quantidade de entrada' : 'Novo saldo contado'} ({product.unit}) · obrigatório<input id="stock-quantity" inputMode="decimal" value={quantity} aria-describedby="stock-quantity-help" onChange={(event) => { setQuantity(event.target.value); setError('') }} /></label></div>
        <p id="stock-quantity-help" className="editor-hint">{kind === 'entry' ? 'Informe uma quantidade positiva para adicionar ao saldo.' : 'Informe o saldo final, inclusive zero ou negativo. A diferença será registrada no histórico.'} Até três casas decimais.</p>
        <label className="editor-check"><input type="checkbox" checked={known} onChange={(event) => { setKnown(event.target.checked); setError('') }} />Informar custo unitário conhecido</label>
        {known && <label>Custo unitário (R$)<input inputMode="decimal" value={cost} onChange={(event) => { setCost(event.target.value); setError('') }} /></label>}
        <p className="editor-hint">Custo informado atualiza o cadastro; sem informar, o custo atual é preservado. Não há cálculo de custo médio nesta demonstração.</p>
        <label>Motivo · obrigatório<textarea id="stock-reason" rows={2} maxLength={300} value={reason} onChange={(event) => { setReason(event.target.value); setError('') }} /></label>
        <dl className="stock-preview"><div><dt>Saldo anterior</dt><dd>{quantityText(product.stock)} {product.unit}</dd></div><div><dt>Diferença</dt><dd>{after === undefined ? '—' : quantityText(Math.round((after - product.stock) * 1000) / 1000)}</dd></div><div><dt>Saldo final</dt><dd>{after === undefined ? '—' : quantityText(after)} {product.unit}</dd></div></dl>
        {error && <p className="editor-error" role="alert">{error}</p>}{busy && <p role="status">Registrando movimento simulado…</p>}
        <p className="editor-hint">Dados fictícios em memória. Cancelar não gera movimento. Recarregar apaga os lançamentos.</p>
        <details className="demo-controls"><summary>Cenários de demonstração</summary><label className="editor-check"><input type="checkbox" checked={authorized} onChange={(event) => { setAuthorized(event.target.checked); setError('') }} />Permitir movimentação (simulação)</label><label className="editor-check"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />Simular falha ao registrar</label></details>
      </fieldset>
      <footer><button type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="sales-primary" disabled={busy}>Confirmar movimento simulado</button></footer>
    </form>
  </DemoDialog>
}

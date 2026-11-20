import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { PaymentMethod } from './demoSales'
import { money } from './demoSales'
import { moneyInput, parseMoney } from './saleDraft'
import { DemoDialog } from './DemoDialog'
import { PaymentIcon } from '../../ui/AppIcon'

export type DemoPayment = { method: PaymentMethod; appliedCents: number; tenderedCents: number; changeCents: number }
const methods: PaymentMethod[] = ['Dinheiro', 'Crédito', 'Débito', 'Pix']
export function PaymentDialog({ total, onBack, onConfirm }: { total: number; onBack: () => void; onConfirm: (payments: DemoPayment[]) => void }) {
  const [amounts, setAmounts] = useState<Record<PaymentMethod, string>>({ Dinheiro: moneyInput(total), Crédito: '', Débito: '', Pix: '' })
  const [phase, setPhase] = useState<'idle' | 'saving'>('idle')
  const [error, setError] = useState('')
  const [fail, setFail] = useState(false)
  const lock = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const inputRefs = useRef<Partial<Record<PaymentMethod, HTMLInputElement>>>({})
  const focusAfterUpdate = useRef<PaymentMethod | undefined>(undefined)
  const [focusedMethod, setFocusedMethod] = useState<PaymentMethod>('Dinheiro')
  const values = Object.fromEntries(methods.map((method) => [method, amounts[method].trim() ? parseMoney(amounts[method]) : 0])) as Record<PaymentMethod, number | undefined>
  const malformed = methods.some((method) => values[method] === undefined)
  const digital = (values.Crédito ?? 0) + (values.Débito ?? 0) + (values.Pix ?? 0)
  const cash = values.Dinheiro ?? 0
  const received = cash + digital
  const remaining = Math.max(0, total - received)
  const change = Math.max(0, received - total)
  const split = methods.filter((method) => (values[method] ?? 0) > 0).length > 1
  const invalid = malformed ? 'Informe valores positivos com até duas casas decimais.' : digital > total ? 'O valor dos pagamentos digitais excede o total. Troco é permitido apenas em dinheiro.' : remaining > 0 ? 'Faltam ' + money(remaining) + ' para completar o pagamento.' : ''
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useLayoutEffect(() => {
    const method = focusAfterUpdate.current
    if (!method) return
    focusAfterUpdate.current = undefined
    inputRefs.current[method]?.focus()
    inputRefs.current[method]?.select()
  }, [amounts])

  function confirm() {
    if (lock.current) return
    if (invalid) { setError(invalid); return }
    lock.current = true
    setPhase('saving'); setError('')
    const payments: DemoPayment[] = methods.filter((method) => (values[method] ?? 0) > 0).map((method) => ({ method, tenderedCents: values[method]!, appliedCents: values[method]! - (method === 'Dinheiro' ? change : 0), changeCents: method === 'Dinheiro' ? change : 0 }))
    timer.current = window.setTimeout(() => {
      if (fail) { lock.current = false; setPhase('idle'); setError('Falha simulada ao concluir. Nenhuma venda foi adicionada. Seus valores foram mantidos para tentar novamente.'); return }
      onConfirm(payments)
    }, 650)
  }
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'F2' || event.ctrlKey || event.altKey || event.metaKey) return
      event.preventDefault()
      if (!event.repeat) confirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function payOnly(method: PaymentMethod) {
    if (lock.current) return
    focusAfterUpdate.current = method
    setFocusedMethod(method)
    setAmounts({ Dinheiro: '', Crédito: '', Débito: '', Pix: '', [method]: moneyInput(total) }); setError('')
  }
  function navigateMethod(event: ReactKeyboardEvent<HTMLDivElement>, method: PaymentMethod) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || lock.current) return
    event.preventDefault()
    const index = methods.indexOf(method)
    const target = methods[Math.max(0, Math.min(methods.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
    if (target === method) return
    if (!split) payOnly(target)
    else {
      setFocusedMethod(target)
      inputRefs.current[target]?.focus()
      inputRefs.current[target]?.select()
    }
  }
  return <DemoDialog title="Conferência de pagamento" onClose={onBack} locked={phase === 'saving'} className="payment-dialog">
    <form onSubmit={(event) => { event.preventDefault(); confirm() }}>
      <fieldset disabled={phase === 'saving'} className="payment-fields">
        <legend className="visually-hidden">Meios de pagamento informados manualmente</legend>
        <div className="payment-total"><span>Total a pagar</span><strong>{money(total)}</strong></div>
        <p className="payment-hint" id="payment-keyboard-hint">{split ? 'Pagamento dividido: ↑ ↓ movem o foco e preservam os valores informados.' : '↑ ↓ escolhem o meio com o valor total. Tab permite editar ou dividir o pagamento.'}</p>
        {methods.map((method, index) => <div className={'payment-entry' + ((values[method] ?? 0) > 0 ? ' has-amount' : '') + (focusedMethod === method ? ' is-current-method' : '')} key={method} onKeyDown={(event) => navigateMethod(event, method)}>
          <button type="button" className="payment-method" aria-label={'Pagar com ' + method} onClick={() => payOnly(method)}><PaymentIcon method={method} />{method}</button>
          <label><span className="visually-hidden">Valor em {method}</span><span className="currency-prefix" aria-hidden="true">R$</span><input ref={(input) => { inputRefs.current[method] = input ?? undefined }} data-initial-focus={index === 0 ? '' : undefined} aria-describedby="payment-keyboard-hint" aria-keyshortcuts="ArrowUp ArrowDown" inputMode="decimal" value={amounts[method]} placeholder="0,00" onFocus={(event) => { setFocusedMethod(method); event.target.select() }} onChange={(event) => { setAmounts({ ...amounts, [method]: event.target.value }); setError('') }} /></label>
          <button className="payment-remainder" type="button" aria-label={'Completar restante em ' + method} disabled={remaining === 0 || malformed} onClick={() => { setAmounts({ ...amounts, [method]: moneyInput((values[method] ?? 0) + remaining) }); setError('') }}>+ restante</button>
        </div>)}
        <div className="payment-breakdown"><div><span>Informado</span><strong>{money(received)}</strong></div><div><span>Restante</span><strong>{money(remaining)}</strong></div><div className="change"><span>Troco em dinheiro</span><strong>{money(digital > total ? 0 : change)}</strong></div></div>
        {(error || invalid) && <p className="checkout-error" role={error ? 'alert' : 'status'}>{error || invalid}</p>}
        <details className="demo-controls"><summary>Cenário de demonstração</summary><label className="check-option"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />Simular falha ao concluir</label></details>
      </fieldset>
      {phase === 'saving' && <p className="payment-saving" role="status">Concluindo simulação…</p>}
      <footer><button className="sales-secondary" type="button" onClick={onBack} disabled={phase === 'saving'}>Voltar à venda</button><button className="sales-primary" type="submit" disabled={phase === 'saving'}>{phase === 'saving' ? 'Aguarde…' : 'Concluir simulação — F2'}</button></footer>
    </form>
  </DemoDialog>
}

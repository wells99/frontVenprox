import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { OpenCashDialog } from '../cash/OpenCashDialog'
import { cashMethods, demoTerminal } from '../cash/cashDemo'
import { money } from '../sales/demoSales'
import type { PaymentMethod } from '../sales/demoSales'
import { moneyInput, parseMoney } from '../sales/saleDraft'
import type { Customer } from './customerDemo'
import type { CreditAction } from './CreditPage'
import { creditBalance, creditLabels, lastCreditEntryId, validateCreditCommand } from './creditDemo'
import type { CreditCommand, CreditEntry, CreditKind, CreditState } from './creditDemo'
import '../products/editor.css'
import './customers.css'
type Props = { state: CreditState; customer: Customer; action: CreditAction; original?: CreditEntry; onConfirm: (command: CreditCommand) => string | undefined; onOpenCash: (amount: number) => void; onClose: () => void }
export function CreditDialog({ state, customer, action, original, onConfirm, onOpenCash, onClose }: Props) {
  const [id] = useState(() => crypto.randomUUID())
  const [expectedBalance] = useState(() => creditBalance(state.creditEntries, customer.id))
  const [expectedLastEntryId] = useState(() => lastCreditEntryId(state.creditEntries, customer.id))
  const [kind, setKind] = useState<CreditKind>(action === 'settle' ? 'receipt' : action)
  const [full, setFull] = useState(action === 'settle')
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('Dinheiro')
  const [registerCash, setRegisterCash] = useState(original?.sessionNumber !== undefined)
  const [authorized, setAuthorized] = useState(true)
  const [fail, setFail] = useState(false)
  const [busy, setBusy] = useState(false)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const session = state.sessions.find((item) => !item.closedAt && item.terminal === demoTerminal)
  const amount = original ? original.amount : full && kind !== 'increase' ? expectedBalance : parseMoney(value)
  const delta = original ? -original.delta : kind === 'increase' ? (amount ?? 0) : -(amount ?? 0)
  const after = amount === undefined ? undefined : expectedBalance + delta
  const affectsCash = original ? original.sessionNumber !== undefined : kind === 'receipt' && registerCash
  const receiptMethod = original?.method ?? method
  function confirm() {
    if (lock.current) return
    const command: CreditCommand = { id, customerId: customer.id, kind, amount: amount ?? 0, reason, method: receiptMethod, registerCash: affectsCash, sessionNumber: affectsCash ? session?.number : undefined, reversesId: original?.id, expectedBalance, expectedLastEntryId, authorized, at: new Date().toISOString() }
    const validation = validateCreditCommand(state, command)
    if (validation) { setError(validation); if (!amount) document.getElementById('credit-value')?.focus(); else if (!reason.trim()) document.getElementById('credit-reason')?.focus(); return }
    lock.current = true; setBusy(true); setError('')
    timer.current = window.setTimeout(() => {
      const message = fail ? 'Falha simulada. Dívida e caixa não foram alterados. Seus dados foram mantidos para tentar novamente.' : onConfirm(command)
      if (message) { lock.current = false; setBusy(false); setError(message) }
    }, 600)
  }
  const title = original ? 'Reverter lançamento de fiado' : 'Lançar no fiado'
  return <DemoDialog title={title} eyebrow="Fiado manual · demonstração em memória" onClose={onClose} locked={busy || opening} className="catalog-dialog credit-dialog">
    <form noValidate onSubmit={(event) => { event.preventDefault(); confirm() }}>
      <div className="credit-dialog-scroll"><fieldset className="editor-body" disabled={busy || opening}>
        <p className="editor-hint"><strong>{customer.name}</strong> · Dívida atual: {money(expectedBalance)}</p>
        {original ? <p className="editor-hint">Reversão integral de {creditLabels[original.kind].toLowerCase()} de {money(original.amount)}, registrado em {new Date(original.at).toLocaleString('pt-BR')}. O lançamento original permanecerá identificado no histórico.</p> : <label>Tipo de lançamento<select data-initial-focus value={kind} onChange={(event) => { setKind(event.target.value as CreditKind); setFull(false); setRegisterCash(false); setError('') }}><option value="increase">Correção · aumentar dívida</option><option value="decrease">Correção · diminuir dívida</option><option value="receipt">Recebimento · recebi um pagamento</option></select></label>}
        {!original && kind !== 'increase' && <label className="editor-check"><input type="checkbox" checked={full} onChange={(event) => { setFull(event.target.checked); setError('') }} />Usar dívida total · {money(expectedBalance)}</label>}
        <label>Valor (R$) · obrigatório<input id="credit-value" data-initial-focus={original ? true : undefined} inputMode="decimal" value={original || full && kind !== 'increase' ? moneyInput(amount ?? 0) : value} readOnly={!!original || full && kind !== 'increase'} onChange={(event) => { setValue(event.target.value); setError('') }} /></label>
        <label>Motivo · obrigatório<textarea id="credit-reason" rows={2} maxLength={300} value={reason} onChange={(event) => { setReason(event.target.value); setError('') }} /></label>
        {kind === 'receipt' && !original && <><label>Meio do recebimento<select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{cashMethods.map((item) => <option key={item}>{item}</option>)}</select></label><label className="editor-check"><input id="credit-register-cash" type="checkbox" checked={registerCash} onChange={(event) => { setRegisterCash(event.target.checked); setError('') }} />Registrar no caixa</label><p className="editor-hint">O meio é informado manualmente; não há confirmação bancária automática.</p></>}
        <div className="credit-preview" aria-label="Prévia do lançamento"><p>Dívida antes: <strong>{money(expectedBalance)}</strong></p><p>Dívida após: <strong>{after === undefined ? '—' : money(after)}</strong></p><p>{affectsCash ? (original ? 'Será registrada uma saída de ' : 'Será registrado recebimento de ') + (amount === undefined ? '—' : money(amount)) + ' em ' + receiptMethod + (session ? ' no caixa #' + session.number + '.' : '. É necessário abrir o caixa.') : 'O caixa não será alterado.'}</p>{original?.sessionNumber !== undefined && <p>Origem: caixa #{original.sessionNumber}. A compensação será registrada na sessão atualmente aberta; caixas encerrados mantêm seus valores.</p>}</div>
        {affectsCash && !session && <div className="customer-selection-banner"><p className="editor-hint">Não há caixa aberto neste terminal. A abertura preserva valor, motivo e meio deste lançamento.</p><button id="credit-open-cash" type="button" className="sales-secondary" onClick={() => setOpening(true)}>Abrir caixa para este lançamento</button></div>}
        {error && <p className="editor-error" role="alert">{error}</p>}{busy && <p role="status">Registrando lançamento simulado…</p>}
        <p className="editor-hint">Dados e histórico apenas em memória. Não há nova venda, faturamento, estoque ou envio real.</p>
        <details className="demo-controls"><summary>Cenários de lançamento</summary><label className="editor-check"><input type="checkbox" checked={authorized} onChange={(event) => { setAuthorized(event.target.checked); setError('') }} />Permitir lançamento (simulação)</label><label className="editor-check"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />Simular falha ao salvar</label></details>
      </fieldset></div>
      <footer><button type="button" className="sales-secondary" disabled={busy || opening} onClick={onClose}>Cancelar</button><button className="sales-primary" disabled={busy || opening}>{original ? 'Confirmar reversão simulada' : 'Salvar lançamento simulado'}</button></footer>
    </form>
    {opening && <OpenCashDialog origin="credit" onOpen={(amount) => { onOpenCash(amount); setOpening(false); setError(''); requestAnimationFrame(() => document.getElementById('credit-reason')?.focus()) }} onClose={() => { setOpening(false); requestAnimationFrame(() => document.getElementById('credit-open-cash')?.focus()) }} />}
  </DemoDialog>
}

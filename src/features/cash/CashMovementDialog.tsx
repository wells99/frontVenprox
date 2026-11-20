import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { money } from '../sales/demoSales'
import { parseMoney } from '../sales/saleDraft'
import { demoOperator, summarizeCash, validateCashMovement } from './cashDemo'
import type { CashSession, ManualCashCommand, ManualCashKind } from './cashDemo'
import './cash.css'

type Props = { session: CashSession; initialKind: ManualCashKind; onClose: () => void; onConfirm: (command: ManualCashCommand) => void }

export function CashMovementDialog({ session, initialKind, onClose, onConfirm }: Props) {
  const [kind, setKind] = useState(initialKind)
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [authorized, setAuthorized] = useState(true)
  const [fail, setFail] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [id] = useState(() => 'manual-' + crypto.randomUUID())
  const inputRef = useRef<HTMLInputElement>(null)
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const amount = parseMoney(value)
  const balance = summarizeCash(session).expectedCash
  const projected = amount === undefined ? undefined : balance + amount * (kind === 'supply' ? 1 : -1)
  function confirm() {
    if (lock.current) return
    const command: ManualCashCommand = { id, sessionNumber: session.number, kind, amount: amount ?? 0, reason, authorized, at: new Date().toISOString() }
    const validation = validateCashMovement([session], command)
    if (validation) {
      setError(validation)
      if (!amount) inputRef.current?.focus()
      else if (!reason.trim()) reasonRef.current?.focus()
      return
    }
    lock.current = true; setBusy(true); setError('')
    timer.current = window.setTimeout(() => {
      if (fail) {
        lock.current = false; setBusy(false)
        setError('Falha simulada ao registrar o movimento. Nenhum valor foi alterado. Seus dados foram mantidos para tentar novamente.')
        window.requestAnimationFrame(() => inputRef.current?.focus())
        return
      }
      onConfirm(command)
    }, 650)
  }
  return <DemoDialog title="Movimentar dinheiro" eyebrow="Suprimento e sangria · dados fictícios" onClose={onClose} locked={busy} className="cash-opening-dialog cash-movement-dialog">
    <form onSubmit={(event) => { event.preventDefault(); confirm() }} onKeyDown={(event) => { if (event.key === 'Enter' && event.repeat) event.preventDefault() }}>
      <div className="cash-opening-body">
        <p className="cash-opening-intro">Registre uma entrada ou retirada de dinheiro físico da gaveta.</p>
        <dl className="cash-identification"><div><dt>Sessão atual</dt><dd>Caixa #{session.number} · {session.terminal}</dd></div><div><dt>Operador</dt><dd>{demoOperator}</dd></div></dl>
        <fieldset className="cash-movement-types" disabled={busy}><legend>Tipo de movimento</legend>
          <label><input type="radio" name="cash-kind" checked={kind === 'supply'} onChange={() => { setKind('supply'); setError('') }} /><span><strong>Suprimento</strong><small>Adicionar dinheiro</small></span></label>
          <label><input type="radio" name="cash-kind" checked={kind === 'withdrawal'} onChange={() => { setKind('withdrawal'); setError('') }} /><span><strong>Sangria</strong><small>Remover dinheiro</small></span></label>
        </fieldset>
        <label className="cash-opening-label" htmlFor="cash-movement-value">Valor em dinheiro (R$) · obrigatório</label>
        <input data-initial-focus ref={inputRef} id="cash-movement-value" className="cash-opening-input" inputMode="decimal" autoComplete="off" placeholder="0,00" value={value} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={'cash-movement-help' + (error ? ' cash-movement-error' : '')} onChange={(event) => { setValue(event.target.value); setError('') }} />
        <p id="cash-movement-help" className="cash-hint">Informe um valor positivo. O tipo selecionado determina a entrada ou saída.</p>
        <label className="cash-opening-label cash-reason-label" htmlFor="cash-movement-reason">Motivo · obrigatório</label>
        <textarea ref={reasonRef} id="cash-movement-reason" rows={2} maxLength={300} value={reason} disabled={busy} placeholder={kind === 'supply' ? 'Ex.: troco para atendimento' : 'Ex.: retirada para depósito'} aria-describedby={error ? 'cash-movement-error' : undefined} onChange={(event) => { setReason(event.target.value); setError('') }} />
        <dl className="cash-breakdown cash-movement-preview"><div><dt>Dinheiro esperado agora</dt><dd>{money(balance)}</dd></div><div><dt>Após {kind === 'supply' ? 'o suprimento' : 'a sangria'}</dt><dd>{projected === undefined ? '—' : money(projected)}</dd></div></dl>
        {projected !== undefined && projected < 0 && <p className="cash-hint">O dinheiro esperado ficará negativo. Confira o valor e os movimentos da sessão.</p>}
        {error && <p id="cash-movement-error" className="cash-error" role="alert">{error}</p>}
        {busy && <p className="cash-notice" role="status">Registrando movimento simulado…</p>}
        <p className="cash-memory">Simulação em memória, sem movimentação real. Recarregar apaga os lançamentos. Permissões efetivas dependem do serviço futuro.</p>
        <details className="demo-controls"><summary>Cenários de demonstração</summary><label className="cash-check"><input type="checkbox" checked={authorized} disabled={busy} onChange={(event) => { setAuthorized(event.target.checked); setError('') }} />Permitir movimento (simulação)</label><label className="cash-check"><input type="checkbox" checked={fail} disabled={busy} onChange={(event) => setFail(event.target.checked)} />Simular falha de registro</label></details>
      </div>
      <footer><button type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button type="submit" className="sales-primary" disabled={busy}>{busy ? 'Registrando…' : 'Confirmar ' + (kind === 'supply' ? 'suprimento simulado' : 'sangria simulada')}</button></footer>
    </form>
  </DemoDialog>
}

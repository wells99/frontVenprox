import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { money } from '../sales/demoSales'
import type { PaymentMethod } from '../sales/demoSales'
import { parseMoney } from '../sales/saleDraft'
import { PaymentIcon } from '../../ui/AppIcon'
import { cashMethods, demoOperator, summarizeCash, validateCashClosing } from './cashDemo'
import type { CashSession, CloseCashCommand } from './cashDemo'
import './cash.css'

export function CloseCashDialog({ session, onClose, onConfirm }: { session: CashSession; onClose: () => void; onConfirm: (command: CloseCashCommand) => string | undefined }) {
  const [values, setValues] = useState<Record<PaymentMethod, string>>({ Dinheiro: '', Crédito: '', Débito: '', Pix: '' })
  const [reason, setReason] = useState('')
  const [authorized, setAuthorized] = useState(true)
  const [fail, setFail] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invalidMethod, setInvalidMethod] = useState<PaymentMethod | undefined>()
  const [snapshot] = useState(() => ({ id: 'closing-' + crypto.randomUUID(), movementIds: session.movements.map((movement) => movement.id), expected: summarizeCash(session).byMethod }))
  const fields = useRef<Partial<Record<PaymentMethod, HTMLInputElement | null>>>({})
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const difference = cashMethods.some((method) => parseMoney(values[method]) !== undefined && parseMoney(values[method]) !== snapshot.expected[method])
  function confirm() {
    if (lock.current) return
    const invalid = cashMethods.find((method) => parseMoney(values[method]) === undefined)
    if (invalid) {
      setInvalidMethod(invalid); setError('Informe o valor conferido em ' + invalid + ', inclusive zero. Use até duas casas decimais, sem separador de milhar.')
      fields.current[invalid]?.focus(); return
    }
    const counted = Object.fromEntries(cashMethods.map((method) => [method, parseMoney(values[method])!])) as Record<PaymentMethod, number>
    const command: CloseCashCommand = { id: snapshot.id, sessionNumber: session.number, counted, reason, authorized, at: new Date().toISOString(), movementIds: snapshot.movementIds }
    const validation = validateCashClosing([session], command)
    if (validation) { setError(validation); if (difference && !reason.trim()) reasonRef.current?.focus(); return }
    lock.current = true; setBusy(true); setError(''); setInvalidMethod(undefined)
    timer.current = window.setTimeout(() => {
      const failure = fail ? 'Falha simulada ao fechar o caixa. A sessão continua aberta; seus valores foram mantidos para tentar novamente.' : onConfirm(command)
      if (failure) {
        lock.current = false; setBusy(false); setError(failure)
        window.requestAnimationFrame(() => fields.current.Dinheiro?.focus())
      }
    }, 650)
  }
  return <DemoDialog title="Conferir e fechar caixa" eyebrow="Fechamento · dados fictícios" className="cash-closing-dialog" locked={busy} onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); confirm() }} onKeyDown={(event) => { if (event.key === 'Enter' && event.repeat) event.preventDefault() }}>
      <div className="cash-closing-body">
        <dl className="cash-identification"><div><dt>Sessão atual</dt><dd>Caixa #{session.number} · {session.terminal}</dd></div><div><dt>Operador</dt><dd>{demoOperator}</dd></div></dl>
        <p className="cash-opening-intro" id="cash-closing-help">Conte cédulas e moedas em Dinheiro. Confira os outros meios nos seus registros, separados da gaveta. Informe zero quando não houver valor.</p>
        <div className="cash-closing-table"><table><caption className="visually-hidden">Conferência por meio de pagamento em reais</caption><thead><tr><th scope="col">Meio</th><th scope="col">Esperado</th><th scope="col">Conferido (R$)</th><th scope="col">Diferença</th></tr></thead><tbody>{cashMethods.map((method, index) => {
          const cents = parseMoney(values[method])
          const delta = cents === undefined ? undefined : cents - snapshot.expected[method]
          return <tr key={method}><th scope="row"><span><PaymentIcon method={method} size={18} />{method}</span>{method === 'Dinheiro' && <small>Contagem física</small>}</th><td>{money(snapshot.expected[method])}</td><td><input data-initial-focus={index === 0 ? true : undefined} ref={(element) => { fields.current[method] = element }} aria-label={method === 'Dinheiro' ? 'Dinheiro contado (R$)' : method + ' conferido (R$)'} inputMode="decimal" autoComplete="off" placeholder="0,00" value={values[method]} disabled={busy} aria-invalid={invalidMethod === method} aria-describedby={'cash-closing-help' + (error ? ' cash-closing-error' : '')} onChange={(event) => { setValues((previous) => ({ ...previous, [method]: event.target.value })); setError(''); setInvalidMethod(undefined) }} /></td><td className={delta ? 'cash-difference' : ''}>{delta === undefined ? '—' : money(delta)}</td></tr>
        })}</tbody></table></div>
        <label className="cash-opening-label" htmlFor="cash-closing-reason">Motivo das diferenças {difference ? '· obrigatório' : '· se houver diferença'}</label>
        <textarea id="cash-closing-reason" ref={reasonRef} rows={2} maxLength={300} value={reason} disabled={busy} aria-describedby={error ? 'cash-closing-error' : undefined} onChange={(event) => { setReason(event.target.value); setError('') }} />
        {error && <p className="cash-error" id="cash-closing-error" role="alert">{error}</p>}
        {busy && <p className="cash-notice" role="status">Simulando fechamento do caixa…</p>}
        <p className="cash-hint">Ao confirmar, esta sessão deixa de receber vendas e movimentos. Uma nova venda exigirá outra abertura. Diferenças ficam registradas e não ajustam os recebimentos.</p>
        <p className="cash-memory">Fechamento apenas em memória, sem gravação local ou envio real. Conferir os meios não confirma conciliação bancária. Recarregar apaga esta simulação.</p>
        <details className="demo-controls"><summary>Cenários de demonstração</summary><label className="cash-check"><input type="checkbox" checked={authorized} disabled={busy} onChange={(event) => { setAuthorized(event.target.checked); setError('') }} />Permitir fechamento (simulação)</label><label className="cash-check"><input type="checkbox" checked={fail} disabled={busy} onChange={(event) => setFail(event.target.checked)} />Simular falha de fechamento</label></details>
      </div>
      <footer><button type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Voltar sem fechar</button><button type="submit" className="sales-primary" disabled={busy}>{busy ? 'Fechando…' : 'Confirmar fechamento simulado'}</button></footer>
    </form>
  </DemoDialog>
}

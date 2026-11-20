import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { parseMoney } from '../sales/saleDraft'
import { money } from '../sales/demoSales'
import { demoOperator, demoTerminal } from './cashDemo'
import './cash.css'

export function OpenCashDialog({ origin, onClose, onOpen }: { origin: 'sale' | 'cash'; onClose: () => void; onOpen: (amount: number) => void }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const lock = useRef(false)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  function open() {
    if (lock.current) return
    const cents = parseMoney(value)
    if (cents === undefined) { setError('Informe o valor existente na gaveta. Se não houver dinheiro, digite 0,00. Use até duas casas decimais, sem separador de milhar.'); inputRef.current?.focus(); return }
    lock.current = true; setBusy(true); setError('')
    timer.current = window.setTimeout(() => {
      if (fail) { lock.current = false; setBusy(false); setError('Falha simulada ao abrir o caixa. Nenhuma sessão foi criada. Seu valor foi mantido para tentar novamente.'); inputRef.current?.focus(); return }
      onOpen(cents)
    }, 650)
  }
  return <DemoDialog title="Abrir caixa" eyebrow="Abertura · dados fictícios" onClose={onClose} locked={busy} className="cash-opening-dialog">
    <form onSubmit={(event) => { event.preventDefault(); open() }} onKeyDown={(event) => { if (event.key === 'Enter' && event.repeat) event.preventDefault() }}>
      <div className="cash-opening-body">
        <p className="cash-opening-intro">{origin === 'sale' ? 'Abra o caixa antes de iniciar a venda. Ao concluir, você retorna à montagem.' : 'Informe o dinheiro que já está na gaveta para iniciar esta sessão.'}</p>
        <dl className="cash-identification"><div><dt>Terminal</dt><dd>{demoTerminal}</dd></div><div><dt>Operador</dt><dd>{demoOperator}</dd></div></dl>
        <label className="cash-opening-label" htmlFor="cash-opening-value">Valor inicial em dinheiro (R$)</label>
        <input data-initial-focus ref={inputRef} id="cash-opening-value" className="cash-opening-input" inputMode="decimal" autoComplete="off" placeholder="0,00" value={value} disabled={busy} aria-invalid={Boolean(error)} aria-describedby={'cash-opening-help' + (error ? ' cash-opening-error' : '')} onChange={(event) => { setValue(event.target.value); setError('') }} />
        <p id="cash-opening-help" className="cash-hint">Conte apenas cédulas e moedas. Se a gaveta estiver vazia, informe zero explicitamente.</p>
        {error && <p id="cash-opening-error" className="cash-error" role="alert">{error}</p>}
        {busy && <p className="cash-notice" role="status">Simulando abertura de caixa com {money(parseMoney(value)!)}…</p>}
        <p className="cash-memory">Sessão apenas em memória. Recarregar a página apaga a abertura e as vendas simuladas.</p>
        <details className="demo-controls"><summary>Cenário de demonstração</summary><label className="cash-check"><input type="checkbox" checked={fail} disabled={busy} onChange={(event) => setFail(event.target.checked)} />Simular falha de abertura</label></details>
      </div>
      <footer><button type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button type="submit" className="sales-primary" disabled={busy}>{busy ? 'Abrindo…' : 'Abrir caixa simulado'}</button></footer>
    </form>
  </DemoDialog>
}

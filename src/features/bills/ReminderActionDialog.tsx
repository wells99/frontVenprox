import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { money } from '../sales/demoSales'
import { localReminderNow, reminderWhen } from './reminderDemo'
import type { ReminderAction, ReminderOccurrence, ReminderRule } from './reminderDemo'
import '../products/editor.css'
export function ReminderActionDialog({ kind, occurrence, rule, onConfirm, onClose }: { kind: ReminderAction['kind']; occurrence: ReminderOccurrence; rule: ReminderRule; onConfirm: (command: ReminderAction) => string | undefined; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  function confirm() {
    if (lock.current) return
    lock.current = true; setBusy(true); setError('')
    timer.current = window.setTimeout(() => {
      const error = fail ? 'Falha simulada. Nenhum lembrete foi alterado. Tente novamente.' : onConfirm({ kind, occurrenceId: occurrence.id, expectedVersion: occurrence.version, expectedRuleVersion: rule.version, at: localReminderNow() })
      if (error) { setError(error); setBusy(false); lock.current = false }
    }, 500)
  }
  return <DemoDialog title={kind === 'resolve' ? 'Resolver ocorrência' : 'Interromper série'} eyebrow="Agenda · demonstração em memória" onClose={onClose} locked={busy} className="catalog-dialog"><form onSubmit={(event) => { event.preventDefault(); confirm() }}><fieldset className="editor-body" disabled={busy}><h3>{occurrence.description}</h3><p className="editor-hint">{money(occurrence.amountCents)} · {reminderWhen(occurrence.dueAt)}</p><p className="editor-hint">{kind === 'resolve' ? 'Somente esta ocorrência será marcada como resolvida. Uma série ativa criará a próxima data do calendário, preservando a data original mesmo após adiamento.' : 'Novas ocorrências deixarão de ser geradas. A ocorrência pendente e as resolvidas serão preservadas para consulta.'}</p><p className="editor-hint">Esta ação não confirma pagamento bancário nem altera o caixa.</p>{error && <p className="editor-error" role="alert">{error}</p>}{busy && <p role="status">Atualizando agenda simulada…</p>}<details className="demo-controls"><summary>Cenário da ação</summary><label className="editor-check"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />Simular falha</label></details></fieldset><footer><button data-initial-focus type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="sales-primary" disabled={busy}>{kind === 'resolve' ? 'Marcar como resolvida' : 'Interromper próximas ocorrências'}</button></footer></form></DemoDialog>
}

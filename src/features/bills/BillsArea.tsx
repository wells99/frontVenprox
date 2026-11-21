import { useEffect, useRef, useState } from 'react'
import { ReminderEditor } from './ReminderEditor'
import type { ReminderEditorMode } from './BillsPage'
import { BillsPage } from './BillsPage'
import { ReminderActionDialog } from './ReminderActionDialog'
import { ReminderNotice } from './ReminderNotice'
import { applyReminderAction, applyReminderSave, createDemoReminders, localReminderNow, validateReminderAction, validateReminderSave } from './reminderDemo'
import type { ReminderOccurrence } from './reminderDemo'
export function BillsArea({ active, route }: { active: boolean; route: string }) {
  const [state, setState] = useState(createDemoReminders)
  const [reveal, setReveal] = useState<{ id: string; version: number } | undefined>(undefined)
  function revealOccurrence(id: string) { setReveal((previous) => ({ id, version: (previous?.version ?? 0) + 1 })) }
  const [now, setNow] = useState(localReminderNow)
  const [editor, setEditor] = useState<{ occurrence?: ReminderOccurrence; mode: ReminderEditorMode } | null>(null)
  const [action, setAction] = useState<{ kind: 'resolve' | 'stop'; occurrence: ReminderOccurrence } | null>(null)
  const [notice, setNotice] = useState('')
  const returnFocus = useRef<HTMLElement | null>(null)
  useEffect(() => { const timer = setInterval(() => setNow(localReminderNow()),10000); const tick = () => setNow(localReminderNow()); window.addEventListener('focus',tick); return () => { clearInterval(timer); window.removeEventListener('focus',tick) } }, [])
  useEffect(() => { const clear = () => { setAction(null); setEditor(null) }; window.addEventListener('hashchange',clear); return () => window.removeEventListener('hashchange',clear) }, [])
  function close() { setAction(null); setEditor(null); requestAnimationFrame(() => { const target = returnFocus.current; if (target?.isConnected && !target.matches(':disabled')) target.focus(); else document.getElementById('bills-title')?.focus() }) }
  const actionRule = state.rules.find((item) => item.id === action?.occurrence.ruleId)
  return <>
    {active && notice && <p className="sale-feedback" role="status">{notice}</p>}
    <BillsPage active={active} route={route} state={state} now={now} reveal={reveal} blocked={action !== null || editor !== null} onEdit={(occurrence,mode = 'edit') => { returnFocus.current = document.activeElement as HTMLElement; setNotice(''); setEditor({occurrence,mode}) }} onAction={(kind,occurrence) => { returnFocus.current = document.activeElement as HTMLElement; setNotice(''); setAction({kind,occurrence}) }} />
    {active && action && actionRule && <ReminderActionDialog kind={action.kind} occurrence={action.occurrence} rule={actionRule} onClose={close} onConfirm={(command) => { const error = validateReminderAction(state,command); if (error) return error; setState((previous) => applyReminderAction(previous,command)); setNotice(command.kind === 'resolve' ? 'Ocorrência resolvida na demonstração. Nenhuma saída de caixa foi criada.' : 'Série interrompida na demonstração. Ocorrências existentes preservadas.'); close() }} />}
    {active && editor && <ReminderEditor state={state} occurrence={editor.occurrence} rule={state.rules.find((item) => item.id === editor.occurrence?.ruleId)} mode={editor.mode} onClose={close} onSave={(command) => { const error = validateReminderSave(state,command); if (error) return error; setState((previous) => applyReminderSave(previous,command)); if (command.mode !== 'edit') revealOccurrence(command.occurrenceId ?? command.ruleId + ':g1:0'); setNotice(command.mode === 'postpone' ? 'Ocorrência adiada na demonstração. A recorrência original foi preservada.' : 'Lembrete salvo na demonstração. Dados apenas em memória, sem saída de caixa.'); close() }} />}
    <ReminderNotice occurrences={state.occurrences} route={route} onView={(id) => { revealOccurrence(id); window.location.hash = '/contas-a-pagar/ocorrencia/' + id }} />
  </>
}

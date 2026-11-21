import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { moneyInput, parseMoney } from '../sales/saleDraft'
import { applyReminderSave, frequencyLabels, localReminderNow, occurrenceAt, reminderWhen, validateReminderSave } from './reminderDemo'
import type { Frequency, ReminderOccurrence, ReminderRule, ReminderState, SaveReminderCommand } from './reminderDemo'
import type { ReminderEditorMode } from './BillsPage'
import '../products/editor.css'
import './bills.css'
type Props = { state: ReminderState; occurrence?: ReminderOccurrence; rule?: ReminderRule; mode: ReminderEditorMode; onSave: (command: SaveReminderCommand) => string | undefined; onClose: () => void }
export function ReminderEditor({ state, occurrence, rule, mode, onSave, onClose }: Props) {
  const [ruleId] = useState(() => rule?.id ?? crypto.randomUUID())
  const [description, setDescription] = useState(occurrence?.description ?? '')
  const [value, setValue] = useState(occurrence ? moneyInput(occurrence.amountCents) : '')
  const [dueAt, setDueAt] = useState(occurrence?.dueAt ?? localReminderNow())
  const [recurring, setRecurring] = useState(rule ? rule.frequency !== 'once' : false)
  const [frequency, setFrequency] = useState<Frequency>(rule?.frequency === 'once' || !rule ? 'monthly' : rule.frequency)
  const [interval, setIntervalValue] = useState(String(rule?.interval ?? 1))
  const [scope, setScope] = useState<'occurrence' | 'future'>(mode === 'postpone' || rule && rule.frequency !== 'once' ? 'occurrence' : 'future')
  const [busy, setBusy] = useState(false)
  const [scenario, setScenario] = useState('normal')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const lock = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const postponed = mode === 'postpone'
  const title = postponed ? 'Adiar lembrete' : occurrence ? 'Editar lembrete' : 'Nova conta para lembrar'
  const command: SaveReminderCommand = { ruleId, occurrenceId: occurrence?.id, mode: !occurrence ? 'create' : postponed ? 'postpone' : 'edit', scope, description, amountCents: parseMoney(value) ?? -1, dueAt, frequency: recurring ? frequency : 'once', interval: recurring ? Number(interval) : 1, expectedVersion: occurrence?.version, expectedRuleVersion: rule?.version, at: localReminderNow() }
  const preview = applyReminderSave(state,command)
  const previewRule = preview.rules.find((item) => item.id === ruleId)
  const previewOccurrence = preview.occurrences.find((item) => item.id === occurrence?.id || !occurrence && item.ruleId === ruleId)
  const nextAt = previewRule?.active && previewOccurrence ? occurrenceAt(previewRule,previewOccurrence.sequence + 1) : undefined
  function save() {
    if (lock.current) return
    const next: Record<string,string> = {}
    if (!description.trim()) next.description = 'Informe a descrição da conta.'
    if (parseMoney(value) === undefined) next.value = 'Informe um valor válido, como 50,00. Zero também é permitido.'
    if (!dueAt.slice(0,10)) next.date = 'Informe a data.'
    if (!dueAt.slice(11)) next.time = 'Informe a hora.'
    if (recurring && (!Number.isInteger(Number(interval)) || Number(interval) < 1 || Number(interval) > 365)) next.interval = 'Use um intervalo inteiro entre 1 e 365.'
    const validation = validateReminderSave(state,command)
    if (Object.keys(next).length || validation) {
      if (!Object.keys(next).length) next.form = validation!
      setErrors(next); document.getElementById('reminder-editor-' + Object.keys(next)[0])?.focus(); return
    }
    lock.current = true; setBusy(true); setErrors({})
    timer.current = window.setTimeout(() => {
      const error = scenario === 'error' ? 'Falha simulada. Nenhuma conta foi alterada; seus dados foram preservados.' : scenario === 'conflict' ? 'Versão conflitante simulada. Feche e reabra para revisar o lembrete atual.' : onSave(command)
      if (error) { setErrors({form:error}); setBusy(false); lock.current = false }
    }, 550)
  }
  function error(key: string) { return errors[key] && <small className="editor-error" id={'reminder-error-' + key}>{errors[key]}</small> }
  return <DemoDialog title={title} eyebrow="Agenda · demonstração em memória" onClose={onClose} locked={busy} className="catalog-dialog reminder-editor"><form noValidate onSubmit={(event) => { event.preventDefault(); save() }}><div className="reminder-editor-scroll"><fieldset className="editor-body" disabled={busy}>
    <p className="editor-hint">{postponed ? 'Adie somente esta ocorrência. A data original da recorrência será mantida.' : 'Uma conta para lembrar, sem pagamento bancário ou saída de caixa. Horários da loja em Brasília.'}</p>
    {occurrence && rule?.frequency !== 'once' && !postponed && <label>Aplicar alterações<select value={scope} onChange={(event) => { setScope(event.target.value as 'occurrence' | 'future'); setErrors({}) }}><option value="occurrence">Somente esta ocorrência</option>{rule?.active && <option value="future">Esta ocorrência e as futuras</option>}</select></label>}
    <label>Descrição · obrigatório<input id="reminder-editor-description" data-initial-focus={!postponed || undefined} value={description} maxLength={160} readOnly={postponed} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'reminder-error-description' : undefined} onChange={(event) => { setDescription(event.target.value); setErrors({}) }} />{error('description')}</label>
    <div className="editor-grid"><label>Valor informativo (R$) · obrigatório<input id="reminder-editor-value" value={value} inputMode="decimal" readOnly={postponed} aria-invalid={!!errors.value} aria-describedby={errors.value ? 'reminder-error-value' : undefined} onChange={(event) => { setValue(event.target.value); setErrors({}) }} />{error('value')}</label><label>Data · obrigatório<input id="reminder-editor-date" data-initial-focus={postponed || undefined} type="date" min="2000-01-01" max="2099-12-31" value={dueAt.slice(0,10)} aria-invalid={!!errors.date} onChange={(event) => { setDueAt(event.target.value + 'T' + (dueAt.slice(11) || '09:00')); setErrors({}) }} />{error('date')}</label><label>Hora · obrigatório<input id="reminder-editor-time" type="time" value={dueAt.slice(11)} aria-invalid={!!errors.time} onChange={(event) => { setDueAt((dueAt.slice(0,10) || localReminderNow().slice(0,10)) + 'T' + event.target.value); setErrors({}) }} />{error('time')}</label></div>
    {!postponed && <fieldset className="reminder-repeat" disabled={busy || scope === 'occurrence'}><label className="editor-check"><input type="checkbox" checked={recurring} onChange={(event) => { setRecurring(event.target.checked); setErrors({}) }} />É recorrente?</label>{recurring && <div className="editor-grid"><label>Frequência<select value={frequency} onChange={(event) => { setFrequency(event.target.value as Frequency); setErrors({}) }}>{(['daily','weekly','monthly','yearly'] as Frequency[]).map((item) => <option key={item} value={item}>{frequencyLabels[item]}</option>)}</select></label><label>Intervalo · a cada<input id="reminder-editor-interval" type="number" min="1" max="365" step="1" value={interval} aria-invalid={!!errors.interval} onChange={(event) => { setIntervalValue(event.target.value); setErrors({}) }} />{error('interval')}<small>{frequency === 'daily' ? 'dia(s)' : frequency === 'weekly' ? 'semana(s)' : frequency === 'monthly' ? 'mês(es)' : 'ano(s)'}</small></label></div>}</fieldset>}
    {scope === 'occurrence' && rule?.frequency !== 'once' && <p className="editor-hint">{rule?.active ? 'A regra das próximas ocorrências permanece igual. Para alterá-la, escolha esta ocorrência e as futuras.' : 'A série está interrompida. A alteração vale somente para esta ocorrência e não retoma a série.'}</p>}
    <div className="reminder-preview"><p>{dueAt ? 'Lembrar em: ' + reminderWhen(dueAt) : 'Informe data e hora.'}</p>{nextAt && <p>Após resolver, próxima data da série: <strong>{reminderWhen(nextAt)}</strong>.</p>}{recurring && <p>Meses curtos usam o último dia disponível e preservam o dia original. Mudar a data para esta e as futuras define uma nova referência.</p>}<p>Resolver marca apenas a agenda. O caixa não será alterado.</p></div>
    {errors.form && <p className="editor-error" role="alert">{errors.form}</p>}{busy && <p role="status">Salvando lembrete simulado…</p>}
    <p className="editor-hint">Demonstração em memória, com datas de 2000 a 2099. Recarregar apaga as alterações. Frequências propostas: diária, semanal, mensal e anual.</p>
    <details className="demo-controls"><summary>Cenários do cadastro</summary><label>Resultado ao salvar<select value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="normal">Sucesso</option><option value="error">Falha</option><option value="conflict">Versão conflitante</option></select></label></details>
  </fieldset></div><footer><button className="sales-secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</button><button className="sales-primary" disabled={busy}>{postponed ? 'Salvar adiamento' : 'Salvar lembrete'}</button></footer></form></DemoDialog>
}

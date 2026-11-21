export const reminderTimeZone = 'America/Sao_Paulo'
export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
export type ReminderRule = { id: string; description: string; amountCents: number; anchorAt: string; frequency: Frequency; interval: number; active: boolean; generation: number; version: number }
export type ReminderOccurrence = { id: string; ruleId: string; description: string; amountCents: number; scheduledAt: string; dueAt: string; generation: number; sequence: number; status: 'pending' | 'resolved'; resolvedAt?: string; version: number }
export type ReminderState = { rules: ReminderRule[]; occurrences: ReminderOccurrence[] }
export const frequencyLabels: Record<Frequency, string> = { once: 'Sem repetição', daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' }
export function localReminderNow(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: reminderTimeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)!.value
  return get('year') + '-' + get('month') + '-' + get('day') + 'T' + get('hour') + ':' + get('minute')
}
export function validReminderDate(value: string) {
  if (!/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false
  const date = new Date(value + ':00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,16) === value
}
export function occurrenceAt(rule: Pick<ReminderRule, 'anchorAt' | 'frequency' | 'interval'>, sequence: number): string | undefined {
  if (!validReminderDate(rule.anchorAt) || !Number.isSafeInteger(sequence) || sequence < 0 || !Number.isInteger(rule.interval) || rule.interval < 1 || rule.interval > 365) return undefined
  const [year, month, day] = rule.anchorAt.slice(0,10).split('-').map(Number)
  let date: Date
  if (rule.frequency === 'monthly' || rule.frequency === 'yearly') {
    const targetMonth = month - 1 + (rule.frequency === 'monthly' ? sequence * rule.interval : 0)
    const targetYear = year + (rule.frequency === 'yearly' ? sequence * rule.interval : Math.floor(targetMonth / 12))
    const monthIndex = targetMonth % 12
    const lastDay = new Date(Date.UTC(targetYear, monthIndex + 1, 0)).getUTCDate()
    date = new Date(Date.UTC(targetYear, monthIndex, Math.min(day,lastDay)))
  } else if (rule.frequency === 'daily' || rule.frequency === 'weekly') {
    date = new Date(Date.UTC(year, month - 1, day + sequence * rule.interval * (rule.frequency === 'weekly' ? 7 : 1)))
  } else if (rule.frequency === 'once' && sequence === 0) return rule.anchorAt
  else return undefined
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() > 2099) return undefined
  return date.toISOString().slice(0,10) + rule.anchorAt.slice(10)
}
export function makeOccurrence(rule: ReminderRule, sequence: number): ReminderOccurrence | undefined {
  const at = occurrenceAt(rule,sequence)
  return at ? { id: rule.id + ':g' + rule.generation + ':' + sequence, ruleId: rule.id, description: rule.description, amountCents: rule.amountCents, dueAt: at, scheduledAt: at, generation: rule.generation, sequence, status: 'pending', version: 1 } : undefined
}
export function reminderStatus(occurrence: ReminderOccurrence, now: string) { return occurrence.status === 'resolved' ? 'resolved' : occurrence.dueAt <= now ? 'overdue' : 'upcoming' }
export const reminderWhen = (value: string) => value.slice(0,10).split('-').reverse().join('/') + ' às ' + value.slice(11)
export function recurrenceText(rule?: ReminderRule) { return !rule || rule.frequency === 'once' ? 'Sem repetição' : frequencyLabels[rule.frequency] + ' · intervalo ' + rule.interval + (!rule.active ? ' · interrompida' : '') }
export type ReminderAction = { kind: 'resolve' | 'stop'; occurrenceId: string; expectedVersion: number; expectedRuleVersion: number; at: string }
export function validateReminderAction(state: ReminderState, command: ReminderAction): string | undefined {
  if (!['resolve','stop'].includes(command.kind)) return 'Ação de agenda inválida.'
  const occurrence = state.occurrences.find((item) => item.id === command.occurrenceId)
  const rule = state.rules.find((item) => item.id === occurrence?.ruleId)
  if (!occurrence || !rule) return 'Lembrete não encontrado.'
  if (occurrence.version !== command.expectedVersion || rule.version !== command.expectedRuleVersion) return 'O lembrete mudou. Feche e abra novamente para revisar.'
  if (!validReminderDate(command.at)) return 'Data da ação inválida.'
  if (command.kind === 'resolve' && occurrence.status !== 'pending') return 'Esta ocorrência já foi resolvida.'
  if (command.kind === 'stop' && (!rule.active || rule.frequency === 'once')) return 'Esta série já está interrompida ou não é recorrente.'
}
export function applyReminderAction<T extends ReminderState>(state: T, command: ReminderAction): T {
  if (validateReminderAction(state, command)) return state
  const occurrence = state.occurrences.find((item) => item.id === command.occurrenceId)!
  const rule = state.rules.find((item) => item.id === occurrence.ruleId)!
  if (command.kind === 'stop') return { ...state, rules: state.rules.map((item) => item.id === rule.id ? { ...item, active: false, version: item.version + 1 } : item) }
  let occurrences = state.occurrences.map((item) => item.id === occurrence.id ? { ...item, status: 'resolved' as const, resolvedAt: command.at, version: item.version + 1 } : item)
  const next = rule.active && rule.frequency !== 'once' ? makeOccurrence(rule, occurrence.sequence + 1) : undefined
  if (next && !occurrences.some((item) => item.id === next.id || item.ruleId === rule.id && item.status === 'pending')) occurrences = [...occurrences, next]
  return { ...state, occurrences }
}
export function createDemoReminders(now = localReminderNow()): ReminderState {
  const today = now.slice(0,10)
  const tomorrow = new Date(today + 'T12:00:00Z'); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const yesterday = new Date(today + 'T12:00:00Z'); yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const rules: ReminderRule[] = [
    { id: 'demo-internet', description: 'Internet da loja · exemplo', amountCents: 12990, anchorAt: yesterday.toISOString().slice(0,10) + 'T09:00', frequency: 'monthly', interval: 1, active: true, generation: 1, version: 1 },
    { id: 'demo-rent', description: 'Aluguel · exemplo', amountCents: 150000, anchorAt: tomorrow.toISOString().slice(0,10) + 'T10:00', frequency: 'monthly', interval: 1, active: true, generation: 1, version: 1 },
    { id: 'demo-supplies', description: 'Material de limpeza · exemplo', amountCents: 8500, anchorAt: today + 'T08:00', frequency: 'once', interval: 1, active: true, generation: 1, version: 1 },
  ]
  return { rules, occurrences: rules.map((rule) => { const occurrence = makeOccurrence(rule,0)!; return rule.id === 'demo-supplies' ? { ...occurrence, status: 'resolved', resolvedAt: today + 'T08:30' } : occurrence }) }
}
// Um resumo por verificação. A chave inclui a nova data quando uma ocorrência é adiada.
export function collectReminderNotices(occurrences: ReminderOccurrence[], now: string, seen: ReadonlySet<string>) {
  const due = occurrences.filter((item) => item.status === 'pending' && item.dueAt <= now && !seen.has(item.id + '@' + item.dueAt))
  return { due, keys: due.map((item) => item.id + '@' + item.dueAt) }
}

export type SaveReminderCommand = { ruleId: string; occurrenceId?: string; mode: 'create' | 'edit' | 'postpone'; scope: 'occurrence' | 'future'; description: string; amountCents: number; dueAt: string; frequency: Frequency; interval: number; expectedVersion?: number; expectedRuleVersion?: number; at: string }
export function validateReminderSave(state: ReminderState, command: SaveReminderCommand): string | undefined {
  if (!['create','edit','postpone'].includes(command.mode) || !['occurrence','future'].includes(command.scope) || !command.ruleId.trim()) return 'Dados do lembrete inválidos.'
  if (!command.description.trim() || command.description.trim().length > 160) return 'Informe uma descrição com até 160 caracteres.'
  if (!Number.isSafeInteger(command.amountCents) || command.amountCents < 0 || command.amountCents > 999999999) return 'Informe um valor válido, inclusive zero, com até duas casas decimais e sem separador de milhar.'
  if (!validReminderDate(command.dueAt) || !validReminderDate(command.at)) return 'Informe data e hora válidas entre 2000 e 2099.'
  if (!Object.hasOwn(frequencyLabels, command.frequency) || !Number.isInteger(command.interval) || command.interval < 1 || command.interval > 365) return 'Selecione uma frequência e um intervalo inteiro entre 1 e 365.'
  if (command.mode === 'create') {
    if (state.rules.some((rule) => rule.id === command.ruleId)) return 'Este lembrete já foi criado.'
    if (command.occurrenceId) return 'Identidade de ocorrência inválida.'
    return
  }
  const occurrence = state.occurrences.find((item) => item.id === command.occurrenceId && item.ruleId === command.ruleId)
  const rule = state.rules.find((item) => item.id === command.ruleId)
  if (!occurrence || !rule) return 'Lembrete não encontrado.'
  if (occurrence.status !== 'pending') return 'Ocorrências resolvidas são preservadas no histórico e não podem ser editadas.'
  if (occurrence.version !== command.expectedVersion || rule.version !== command.expectedRuleVersion) return 'O lembrete mudou. Feche e abra novamente para revisar a versão atual.'
  if (command.mode === 'postpone') {
    if (command.dueAt <= occurrence.dueAt || command.dueAt <= command.at) return 'Para adiar, escolha uma data/hora futura e posterior ao vencimento atual.'
    if (command.description !== occurrence.description || command.amountCents !== occurrence.amountCents || command.scope !== 'occurrence') return 'Adiamento altera somente data e hora desta ocorrência.'
  } else if (command.scope === 'future' && !rule.active) return 'A série está interrompida. Edite somente esta ocorrência.'
}
export function applyReminderSave<T extends ReminderState>(state: T, command: SaveReminderCommand): T {
  if (validateReminderSave(state,command)) return state
  if (command.mode === 'create') {
    const rule: ReminderRule = { id: command.ruleId, description: command.description.trim(), amountCents: command.amountCents, anchorAt: command.dueAt, frequency: command.frequency, interval: command.frequency === 'once' ? 1 : command.interval, active: true, generation: 1, version: 1 }
    return { ...state, rules: [...state.rules,rule], occurrences: [...state.occurrences,makeOccurrence(rule,0)!] }
  }
  const current = state.occurrences.find((item) => item.id === command.occurrenceId)!
  const rule = state.rules.find((item) => item.id === current.ruleId)!
  if (command.mode === 'postpone' || command.scope === 'occurrence') return { ...state, occurrences: state.occurrences.map((item) => item.id === current.id ? { ...item, description: command.description.trim(), amountCents: command.amountCents, dueAt: command.dueAt, version: item.version + 1 } : item) }
  const scheduleChanged = command.dueAt !== current.dueAt || command.frequency !== rule.frequency || command.interval !== rule.interval
  const updated: ReminderRule = { ...rule, description: command.description.trim(), amountCents: command.amountCents, frequency: command.frequency, interval: command.frequency === 'once' ? 1 : command.interval, anchorAt: scheduleChanged ? command.dueAt : rule.anchorAt, generation: rule.generation + (scheduleChanged ? 1 : 0), version: rule.version + 1 }
  return { ...state, rules: state.rules.map((item) => item.id === rule.id ? updated : item), occurrences: state.occurrences.map((item) => item.id === current.id ? { ...item, description: updated.description, amountCents: updated.amountCents, dueAt: command.dueAt, scheduledAt: scheduleChanged ? command.dueAt : item.scheduledAt, sequence: scheduleChanged ? 0 : item.sequence, generation: updated.generation, version: item.version + 1 } : item) }
}

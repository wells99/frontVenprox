import type { Customer } from './customerDemo'
import { cashMethods, demoOperator, demoTerminal } from '../cash/cashDemo'
import type { CashSession, CashMovement } from '../cash/cashDemo'
import type { PaymentMethod } from '../sales/demoSales'
export type CreditKind = 'increase' | 'decrease' | 'receipt' | 'reversal'
export type CreditEntry = { id: string; customerId: string; customerName: string; kind: CreditKind; amount: number; delta: number; before: number; after: number; reason: string; at: string; operator: string; method?: PaymentMethod; sessionNumber?: number; reversesId?: string }
export const demoCreditEntries: CreditEntry[] = [
  { id: 'credit-ana-receipt', customerId: 'ana', customerName: 'Ana exemplo', kind: 'receipt', amount: 2000, delta: -2000, before: 8000, after: 6000, reason: 'Pagamento parcial fictício, sem caixa', at: '2026-11-20T10:00:00-03:00', operator: 'Administrador exemplo', method: 'Dinheiro' },
  { id: 'credit-ana-opening', customerId: 'ana', customerName: 'Ana exemplo', kind: 'increase', amount: 8000, delta: 8000, before: 0, after: 8000, reason: 'Anotação inicial fictícia', at: '2026-11-19T09:00:00-03:00', operator: 'Administrador exemplo' },
  { id: 'credit-carla-opening', customerId: 'carla', customerName: 'Carla exemplo', kind: 'increase', amount: 1500, delta: 1500, before: 0, after: 1500, reason: 'Anotação inicial fictícia', at: '2026-11-19T08:00:00-03:00', operator: 'Administrador exemplo' },
]
export const creditBalance = (entries: CreditEntry[], customerId: string) => entries.filter((entry) => entry.customerId === customerId).reduce((sum, entry) => sum + entry.delta, 0)
export const creditLabels: Record<CreditKind,string> = { increase: 'Aumento · correção', decrease: 'Redução · correção', receipt: 'Recebimento de fiado', reversal: 'Reversão' }
export type CustomerCredit = { customers: Customer[]; creditEntries: CreditEntry[] }

export type CreditState = CustomerCredit & { sessions: CashSession[] }
export type CreditCommand = { id: string; customerId: string; kind: CreditKind; amount: number; reason: string; method?: PaymentMethod; registerCash: boolean; sessionNumber?: number; reversesId?: string; expectedBalance: number; expectedLastEntryId?: string; authorized: boolean; at: string }
export const lastCreditEntryId = (entries: CreditEntry[], customerId: string) => entries.find((entry) => entry.customerId === customerId)?.id
export function validateCreditCommand(state: CreditState, command: CreditCommand): string | undefined {
  if (!state.customers.some((customer) => customer.id === command.customerId)) return 'Cliente não encontrado. Volte à lista e confira o cadastro.'
  if (!command.authorized) return 'Permissão simulada negada. Nenhum lançamento foi registrado.'
  if (!command.id.trim() || !Number.isFinite(Date.parse(command.at))) return 'Lançamento inválido. Feche e abra novamente o formulário.'
  if (state.creditEntries.some((entry) => entry.id === command.id) || state.sessions.some((session) => session.movements.some((movement) => movement.id === 'credit-' + command.id))) return 'Este lançamento já foi registrado.'
  if (!['increase','decrease','receipt','reversal'].includes(command.kind)) return 'Selecione o tipo de lançamento.'
  if (!Number.isSafeInteger(command.amount) || command.amount <= 0 || command.amount > 999999999) return 'Informe um valor maior que zero com até duas casas decimais, sem separador de milhar.'
  if (!command.reason.trim() || command.reason.trim().length > 300) return 'Informe um motivo com até 300 caracteres.'
  const balance = creditBalance(state.creditEntries, command.customerId)
  if (balance !== command.expectedBalance || lastCreditEntryId(state.creditEntries, command.customerId) !== command.expectedLastEntryId) return 'O histórico do cliente mudou. Feche e abra novamente para revisar o saldo atual.'
  let delta = command.kind === 'increase' ? command.amount : -command.amount
  if (command.kind === 'reversal') {
    const original = state.creditEntries.find((entry) => entry.id === command.reversesId && entry.customerId === command.customerId)
    if (!original || original.kind === 'reversal' || state.creditEntries.some((entry) => entry.reversesId === original.id)) return 'Este lançamento não pode ser revertido ou já possui reversão.'
    if (command.amount !== original.amount) return 'A reversão deve usar o valor integral do lançamento original.'
    if (command.registerCash !== (original.sessionNumber !== undefined)) return 'A reversão deve compensar o efeito no caixa do lançamento original.'
    delta = -original.delta
  } else {
    if (command.reversesId) return 'Referência de reversão inválida.'
    if (command.kind !== 'receipt' && command.registerCash) return 'Correção de anotação não movimenta caixa.'
  }
  if (balance + delta < 0) return command.kind === 'reversal' ? 'A reversão deixaria a dívida negativa. Confira os lançamentos posteriores.' : 'O valor não pode ser maior que a dívida atual.'
  if (balance + delta > 999999999) return 'A dívida resultante excede o limite da demonstração.'
  if (command.kind === 'receipt' && (!command.method || !cashMethods.includes(command.method))) return 'Informe o meio do recebimento.'
  if (command.registerCash) {
    const session = state.sessions.find((item) => item.number === command.sessionNumber && !item.closedAt && item.terminal === demoTerminal)
    if (!session) return 'Abra o caixa neste terminal ou desmarque Registrar no caixa para um recebimento sem caixa.'
    if (Date.parse(command.at) < Date.parse(session.openedAt)) return 'A data do lançamento deve ser posterior à abertura do caixa.'
  }
}
export function registerCreditCommand<T extends CreditState>(state: T, command: CreditCommand): T {
  if (validateCreditCommand(state, command)) return state
  const customer = state.customers.find((item) => item.id === command.customerId)!
  const original = command.kind === 'reversal' ? state.creditEntries.find((entry) => entry.id === command.reversesId)! : undefined
  const before = creditBalance(state.creditEntries, customer.id)
  const delta = original ? -original.delta : command.kind === 'increase' ? command.amount : -command.amount
  const method = original?.method ?? (command.kind === 'receipt' ? command.method : undefined)
  const entry: CreditEntry = { id: command.id, customerId: customer.id, customerName: customer.name, kind: command.kind, amount: command.amount, delta, before, after: before + delta, reason: command.reason.trim(), operator: demoOperator, at: command.at, method, sessionNumber: command.registerCash ? command.sessionNumber : undefined, reversesId: original?.id }
  let sessions = state.sessions
  if (command.registerCash) {
    const movement: CashMovement = { id: 'credit-' + entry.id, kind: original ? 'credit-reversal' : 'credit-receipt', description: (original ? 'Reversão de recebimento de fiado' : 'Recebimento de fiado') + ' · ' + customer.name + ' · ' + entry.reason, at: entry.at, operator: demoOperator, amounts: { [method!]: original ? -entry.amount : entry.amount }, customerId: customer.id, creditEntryId: entry.id, reversesCreditEntryId: original?.id }
    sessions = sessions.map((session) => session.number === command.sessionNumber ? { ...session, sync: 'Pendente', movements: [...session.movements, movement] } : session)
  }
  return { ...state, sessions, creditEntries: [entry, ...state.creditEntries] }
}

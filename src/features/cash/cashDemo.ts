import { totalCents } from '../sales/demoSales'
import type { PaymentMethod, Sale } from '../sales/demoSales'

export const demoTerminal = 'Balcão 01'
export const demoOperator = 'Administrador exemplo'
export const cashMethods: PaymentMethod[] = ['Dinheiro', 'Crédito', 'Débito', 'Pix']
export type CashMovement = {
  id: string
  kind: 'opening' | 'sale' | 'cancellation' | 'credit-receipt' | 'credit-reversal' | 'supply' | 'withdrawal'
  description: string
  at: string
  amounts: Partial<Record<PaymentMethod, number>>
  operator: string
  customerId?: string
  creditEntryId?: string
  reversesCreditEntryId?: string
  saleId?: string
}
export type CashSession = {
  number: number
  terminal: string
  operator: string
  openedAt: string
  closedAt?: string
  countedCashCents?: number
  closing?: { id: string; operator: string; expected: Record<PaymentMethod, number>; counted: Record<PaymentMethod, number>; reason: string }
  sync: 'Pendente' | 'Recebida'
  movements: CashMovement[]
}

export function saleAmounts(sale: Sale): Partial<Record<PaymentMethod, number>> {
  if (sale.payments) return Object.fromEntries(cashMethods.map((method) => [method, sale.payments!.filter((payment) => payment.method === method).reduce((sum, payment) => sum + payment.appliedCents, 0)]))
  return sale.payment === 'Misto' ? {} : { [sale.payment]: totalCents(sale) }
}
export function saleMovement(sale: Sale): CashMovement {
  return { id: 'sale-' + sale.id, kind: 'sale', description: 'Venda #' + sale.number, at: sale.recordedAt ?? sale.date + 'T' + sale.time + ':00-03:00', amounts: saleAmounts(sale), operator: sale.operator, saleId: sale.id }
}
export function cancellationMovement(sale: Sale): CashMovement {
  const amounts = saleAmounts(sale)
  return { id: 'cancel-' + sale.id, kind: 'cancellation', description: 'Cancelamento da venda #' + sale.number, at: sale.cancellation?.at ?? sale.date + 'T19:00:00-03:00', amounts: Object.fromEntries(cashMethods.map((method) => [method, -(amounts[method] ?? 0)])), operator: sale.cancellation?.operator ?? demoOperator, saleId: sale.id }
}
export const movementTotal = (movement: CashMovement) => Object.values(movement.amounts).reduce((sum, amount) => sum + amount, 0)

export type ManualCashKind = 'supply' | 'withdrawal'
export type ManualCashCommand = { id: string; sessionNumber: number; kind: ManualCashKind; amount: number; reason: string; authorized: boolean; at: string }

export function validateCashMovement(sessions: CashSession[], command: ManualCashCommand): string | undefined {
  if (!sessions.some((session) => session.number === command.sessionNumber && session.terminal === demoTerminal && !session.closedAt)) return 'Este caixa não está aberto neste terminal. Volte ao Caixa e confira a sessão.'
  if (!command.authorized) return 'Este operador não tem permissão para movimentar o caixa no cenário atual.'
  if (!['supply', 'withdrawal'].includes(command.kind)) return 'Selecione suprimento ou sangria.'
  if (!Number.isSafeInteger(command.amount) || command.amount <= 0 || command.amount > 999999999) return 'Informe um valor maior que zero, com até duas casas decimais e sem separador de milhar.'
  if (!command.reason.trim() || command.reason.trim().length > 300) return 'Informe um motivo de até 300 caracteres.'
  if (!command.id.trim() || !Number.isFinite(Date.parse(command.at))) return 'Movimento inválido. Feche e abra novamente o formulário.'
}

export function registerCashMovement(sessions: CashSession[], command: ManualCashCommand): CashSession[] {
  if (validateCashMovement(sessions, command) || sessions.some((session) => session.movements.some((movement) => movement.id === command.id))) return sessions
  const movement: CashMovement = { id: command.id, kind: command.kind, description: (command.kind === 'supply' ? 'Suprimento' : 'Sangria') + ' · ' + command.reason.trim(), at: command.at, operator: demoOperator, amounts: { Dinheiro: command.amount * (command.kind === 'supply' ? 1 : -1) } }
  return sessions.map((session) => session.number === command.sessionNumber ? { ...session, sync: 'Pendente', movements: [...session.movements, movement] } : session)
}

export function summarizeCash(session: CashSession) {
  const sumKind = (kind: CashMovement['kind']) => session.movements.filter((movement) => movement.kind === kind).reduce((sum, movement) => sum + movementTotal(movement), 0)
  const byMethod = Object.fromEntries(cashMethods.map((method) => [method, session.movements.reduce((sum, movement) => sum + (movement.amounts[method] ?? 0), 0)])) as Record<PaymentMethod, number>
  const salesByMethod = Object.fromEntries(cashMethods.map((method) => [method, session.movements.filter((movement) => movement.kind === 'sale' || movement.kind === 'cancellation').reduce((sum, movement) => sum + (movement.amounts[method] ?? 0), 0)])) as Record<PaymentMethod, number>
  return { byMethod, salesByMethod, opening: sumKind('opening'), sales: sumKind('sale'), cancellations: Math.abs(sumKind('cancellation')), creditReceipts: sumKind('credit-receipt') + sumKind('credit-reversal'), supplies: sumKind('supply'), withdrawals: Math.abs(sumKind('withdrawal')), expectedCash: byMethod.Dinheiro, digital: byMethod.Crédito + byMethod.Débito + byMethod.Pix }
}

export function openDemoSession(sessions: CashSession[], amount: number, at: string): CashSession[] {
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 999999999 || sessions.some((session) => session.terminal === demoTerminal && !session.closedAt)) return sessions
  const number = Math.max(26, ...sessions.map((session) => session.number)) + 1
  const session: CashSession = { number, terminal: demoTerminal, operator: demoOperator, openedAt: at, sync: 'Pendente', movements: [{ id: 'opening-' + number, kind: 'opening', description: 'Abertura de caixa', at, operator: demoOperator, amounts: { Dinheiro: amount } }] }
  return [session, ...sessions]
}

export type CloseCashCommand = { id: string; sessionNumber: number; counted: Record<PaymentMethod, number>; reason: string; authorized: boolean; at: string; movementIds: string[] }
export function validateCashClosing(sessions: CashSession[], command: CloseCashCommand): string | undefined {
  const session = sessions.find((item) => item.number === command.sessionNumber && item.terminal === demoTerminal && !item.closedAt)
  if (!session) return 'Este caixa não está aberto neste terminal. Volte e confira a sessão.'
  if (!command.authorized) return 'Este operador não tem permissão para fechar o caixa no cenário atual.'
  if (cashMethods.some((method) => !Number.isSafeInteger(command.counted[method]) || command.counted[method] < 0 || command.counted[method] > 999999999)) return 'Informe a contagem de cada meio, inclusive zero, com até duas casas decimais e sem separador de milhar.'
  if (session.movements.map((movement) => movement.id).join('|') !== command.movementIds.join('|')) return 'Os movimentos mudaram durante a conferência. Volte e abra o fechamento novamente para conferir os valores atuais.'
  const expected = summarizeCash(session).byMethod
  if (command.reason.trim().length > 300 || (cashMethods.some((method) => command.counted[method] !== expected[method]) && !command.reason.trim())) return 'Informe o motivo das diferenças, com até 300 caracteres.'
  if (!command.id.trim() || !Number.isFinite(Date.parse(command.at)) || Date.parse(command.at) < Date.parse(session.openedAt)) return 'Dados de fechamento inválidos. Volte e abra o formulário novamente.'
}
export function closeDemoSession(sessions: CashSession[], command: CloseCashCommand): CashSession[] {
  if (validateCashClosing(sessions, command) || sessions.some((session) => session.closing?.id === command.id)) return sessions
  return sessions.map((session) => session.number !== command.sessionNumber ? session : {
    ...session, closedAt: command.at, countedCashCents: command.counted.Dinheiro, sync: 'Pendente',
    closing: { id: command.id, operator: demoOperator, expected: { ...summarizeCash(session).byMethod }, counted: { ...command.counted }, reason: command.reason.trim() },
  })
}
export function registerCashSale(sessions: CashSession[], sale: Sale): CashSession[] {
  return sessions.map((session) => session.number !== sale.cashSession || session.closedAt || session.movements.some((movement) => movement.id === 'sale-' + sale.id) ? session : { ...session, sync: 'Pendente', movements: [...session.movements, saleMovement(sale)] })
}
export function registerCashCancellation(sessions: CashSession[], sale: Sale): CashSession[] {
  // Nesta etapa, só revertemos a venda da própria sessão ainda aberta.
  // A restituição de uma sessão encerrada exige um comando futuro separado.
  return sessions.map((session) => session.number !== sale.cashSession || session.closedAt || sale.status !== 'Cancelada' || !session.movements.some((movement) => movement.id === 'sale-' + sale.id) || session.movements.some((movement) => movement.id === 'cancel-' + sale.id) ? session : { ...session, sync: 'Pendente', movements: [...session.movements, cancellationMovement(sale)] })
}
export function createDemoSessions(sales: Sale[]): CashSession[] {
  return [26, 25].map((number) => {
    const day = number === 26 ? '2026-11-20' : '2026-11-19'
    const movements: CashMovement[] = [
      { id: 'opening-' + number, kind: 'opening', description: 'Abertura de caixa', at: day + 'T09:00:00-03:00', amounts: { Dinheiro: 20000 }, operator: demoOperator },
      ...sales.filter((sale) => sale.cashSession === number).flatMap((sale) => [saleMovement(sale), ...(sale.status === 'Cancelada' ? [{ ...cancellationMovement(sale), at: day + 'T19:00:00-03:00' }] : [])]),
      { id: 'credit-cash-' + number, kind: 'credit-receipt', description: 'Recebimento de fiado · Cliente exemplo', at: day + 'T10:20:00-03:00', amounts: { Dinheiro: 3000 }, operator: demoOperator },
      { id: 'credit-pix-' + number, kind: 'credit-receipt', description: 'Recebimento de fiado · Cliente demonstração', at: day + 'T10:30:00-03:00', amounts: { Pix: 1500 }, operator: demoOperator },
      { id: 'supply-' + number, kind: 'supply', description: 'Suprimento · troco para atendimento', at: day + 'T11:00:00-03:00', amounts: { Dinheiro: 5000 }, operator: demoOperator },
      { id: 'withdrawal-' + number, kind: 'withdrawal', description: 'Sangria · retirada de demonstração', at: day + 'T14:00:00-03:00', amounts: { Dinheiro: -2000 }, operator: demoOperator },
    ]
    const session: CashSession = { number, terminal: demoTerminal, operator: demoOperator, openedAt: day + 'T09:00:00-03:00', closedAt: day + 'T20:00:00-03:00', sync: number === 26 ? 'Pendente' : 'Recebida', movements }
    session.countedCashCents = summarizeCash(session).expectedCash - (number === 25 ? 100 : 0)
    return session
  })
}

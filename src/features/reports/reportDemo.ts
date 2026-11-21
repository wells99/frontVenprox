import type { Sale, PaymentMethod } from '../sales/demoSales'
import { totalCents } from '../sales/demoSales'
import { cashMethods, saleAmounts } from '../cash/cashDemo'
import type { CashSession } from '../cash/cashDemo'
import { localReminderNow } from '../bills/reminderDemo'
export type ReportCriterion = 'sales' | 'movements'
export type ReportFilters = { from: string; to: string; criterion: ReportCriterion; group: 'hour' | 'day' }
export type ReportEvent = { id: string; sale: Sale; kind: 'sale' | 'cancellation'; date: string; time: string; amount: number; knownRevenue: number; knownCost: number; amounts: Partial<Record<PaymentMethod, number>> }
export function validateReportRange(from: string, to: string) {
  const valid = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date + 'T12:00:00Z')) && new Date(date + 'T12:00:00Z').toISOString().slice(0,10) === date
  return !valid(from) || !valid(to) ? 'Informe a data inicial e final válidas.' : from > to ? 'A data inicial deve ser anterior ou igual à final.' : undefined
}
// Rateio exato em centavos pelo maior resto. O desconto também reduz a receita de custo conhecido.
export function saleCostCoverage(sale: Sale) {
  const gross = sale.items.map((item) => item.priceCents * item.quantity)
  const subtotal = gross.reduce((sum,value) => sum + value,0)
  const total = totalCents(sale)
  if (subtotal <= 0) return { knownRevenue: 0, knownCost: sale.items.reduce((sum,item) => sum + (item.costCents ?? 0) * item.quantity,0), revenue: total, knownUnits: sale.items.filter((item) => item.costCents !== undefined).reduce((sum,item) => sum + item.quantity,0), units: sale.items.reduce((sum,item) => sum + item.quantity,0) }
  const parts = gross.map((amount,index) => { const product = BigInt(amount) * BigInt(total); return { index, value: Number(product / BigInt(subtotal)), rest: product % BigInt(subtotal) } })
  const remaining = total - parts.reduce((sum,item) => sum + item.value,0)
  const order = [...parts].sort((a,b) => a.rest === b.rest ? a.index - b.index : a.rest > b.rest ? -1 : 1)
  for (let index = 0; index < remaining; index++) order[index].value++
  return { revenue: total, knownRevenue: parts.reduce((sum,part) => sum + (sale.items[part.index].costCents !== undefined ? part.value : 0),0), knownCost: sale.items.reduce((sum,item) => sum + (item.costCents === undefined ? 0 : item.costCents * item.quantity),0), knownUnits: sale.items.filter((item) => item.costCents !== undefined).reduce((sum,item) => sum + item.quantity,0), units: sale.items.reduce((sum,item) => sum + item.quantity,0) }
}
export function summarizeReport(sales: Sale[], sessions: CashSession[], filters: ReportFilters) {
  const within = (date: string) => date >= filters.from && date <= filters.to
  const events: ReportEvent[] = []
  if (!validateReportRange(filters.from,filters.to)) for (const sale of sales) {
    const cohort = within(sale.date)
    const coverage = saleCostCoverage(sale)
    const add = (kind: ReportEvent['kind'],date: string,time: string) => {
      const sign = kind === 'sale' ? 1 : -1
      events.push({ id: sale.id + ':' + kind, sale, kind, date, time, amount: totalCents(sale) * sign, knownRevenue: coverage.knownRevenue * sign, knownCost: coverage.knownCost * sign, amounts: Object.fromEntries(Object.entries(saleAmounts(sale)).map(([method,amount]) => [method,amount! * sign])) })
    }
    if (cohort) add('sale',sale.date,sale.time)
    if (sale.status === 'Cancelada') {
      const at = sale.cancellation?.at ? localReminderNow(new Date(sale.cancellation.at)) : sale.date + 'T' + sale.time
      if (filters.criterion === 'sales' ? cohort : within(at.slice(0,10))) add('cancellation',filters.criterion === 'sales' ? sale.date : at.slice(0,10),filters.criterion === 'sales' ? sale.time : at.slice(11))
    }
  }
  const registrations = events.filter((event) => event.kind === 'sale')
  const cancelled = events.filter((event) => event.kind === 'cancellation')
  const validRegistrations = registrations.filter((event) => event.sale.status === 'Concluída')
  const gross = registrations.reduce((sum,event) => sum + event.amount,0)
  const reversals = -cancelled.reduce((sum,event) => sum + event.amount,0)
  const net = gross - reversals
  const coverageBase = filters.criterion === 'sales' ? validRegistrations : registrations
  const coverageRevenue = coverageBase.reduce((sum,event) => sum + event.amount,0)
  const knownRevenueBase = coverageBase.reduce((sum,event) => sum + event.knownRevenue,0)
  const coveredUnits = coverageBase.reduce((sum,event) => sum + saleCostCoverage(event.sale).knownUnits,0)
  const units = coverageBase.reduce((sum,event) => sum + saleCostCoverage(event.sale).units,0)
  const count = filters.criterion === 'sales' ? validRegistrations.length : registrations.length
  const ticket = count ? Math.round((filters.criterion === 'sales' ? net : gross) / count) : undefined
  const knownRevenue = events.reduce((sum,event) => sum + event.knownRevenue,0)
  const knownCost = events.reduce((sum,event) => sum + event.knownCost,0)
  const creditMovements = sessions.flatMap((session) => session.movements).filter((movement) => !validateReportRange(filters.from,filters.to) && (movement.kind === 'credit-receipt' || movement.kind === 'credit-reversal') && within(localReminderNow(new Date(movement.at)).slice(0,10)))
  const methods = cashMethods.map((method) => ({ method, sales: events.reduce((sum,event) => sum + (event.amounts[method] ?? 0),0), credit: creditMovements.reduce((sum,event) => sum + (event.amounts[method] ?? 0),0) }))
  const buckets = new Map<string,number>()
  for (const event of events) { const key = filters.group === 'hour' ? event.time.slice(0,2) + 'h' : event.date; buckets.set(key,(buckets.get(key) ?? 0) + event.amount) }
  return { events: events.sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time) || b.sale.number - a.sale.number), gross, reversals, net, registrations: registrations.length, cancellations: cancelled.length, count, ticket, knownRevenue, knownCost, partialProfit: knownRevenue - knownCost, coveredUnits, units, coveragePercent: coverageRevenue > 0 ? knownRevenueBase / coverageRevenue * 100 : undefined, methods, unidentified: net - methods.reduce((sum,item) => sum + item.sales,0), creditNet: methods.reduce((sum,item) => sum + item.credit,0), buckets: [...buckets].sort(([a],[b]) => a.localeCompare(b)).map(([key,amount]) => ({key,amount})) }
}

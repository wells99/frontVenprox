import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
let credit, cash, customers
try {
  credit = await server.ssrLoadModule('/src/features/customers/creditDemo.ts')
  cash = await server.ssrLoadModule('/src/features/cash/cashDemo.ts')
  customers = await server.ssrLoadModule('/src/features/customers/customerDemo.ts')
} finally { await server.close() }
const at = '2026-11-20T18:00:00-03:00'
const initial = () => ({ customers: customers.demoCustomers, creditEntries: credit.demoCreditEntries, sessions: [], sales: [{ id: 'existing' }], products: [{ id: 'p', stock: 10 }] })
const command = (state, overrides = {}) => ({ id: 'intent-1', customerId: 'ana', kind: 'receipt', amount: 2000, reason: 'Pagamento teste', method: 'Dinheiro', registerCash: false, expectedBalance: credit.creditBalance(state.creditEntries, 'ana'), expectedLastEntryId: credit.lastCreditEntryId(state.creditEntries, 'ana'), authorized: true, at, ...overrides })
test('cadastro mínimo permite homônimos e contato vazio; protege versão do mesmo cliente', () => {
  assert.equal(customers.validateCustomer(customers.demoCustomers, { id: 'new', name: 'Ana exemplo', contact: '', active: true, version: 0 }), undefined)
  assert.ok(customers.validateCustomer(customers.demoCustomers, { ...customers.demoCustomers[0], name: '  ' }))
  assert.ok(customers.validateCustomer(customers.demoCustomers, { ...customers.demoCustomers[0], version: 0 }))
})
test('recebimento sem caixa reduz dívida e mantém vendas, estoque e sessões intactos', () => {
  const state = initial()
  const next = credit.registerCreditCommand(state, command(state))
  assert.equal(credit.creditBalance(next.creditEntries, 'ana'), 4000)
  assert.equal(next.creditEntries[0].before, 6000)
  assert.equal(next.creditEntries[0].after, 4000)
  assert.equal(next.sessions, state.sessions)
  assert.equal(next.sales, state.sales)
  assert.equal(next.products, state.products)
  assert.equal(credit.creditBalance(state.creditEntries, 'ana'), 6000)
  assert.equal(credit.creditBalance(next.creditEntries, 'bruno'), 0)
})
test('quitação integral zera dívida uma única vez e nunca permite valor excedente', () => {
  const state = initial(), intent = command(state, { amount: 6000 })
  const next = credit.registerCreditCommand(state, intent)
  assert.equal(credit.creditBalance(next.creditEntries, 'ana'), 0)
  assert.equal(credit.registerCreditCommand(next, intent), next)
  assert.equal(credit.registerCreditCommand(state, command(state, { amount: 6001 })), state)
})
test('correções aumentam ou diminuem com histórico sem produzir caixa', () => {
  const state = initial()
  for (const [kind, after] of [['increase', 8000], ['decrease', 4000]]) {
    const next = credit.registerCreditCommand(state, command(state, { kind }))
    assert.equal(next.creditEntries[0].after, after)
    assert.equal(next.sessions, state.sessions)
    assert.equal(credit.registerCreditCommand(state, command(state, { kind, registerCash: true })), state)
  }
})
test('permissão, motivo, precisão monetária, cliente e versão do histórico bloqueiam mutações', () => {
  const state = initial()
  for (const changes of [{ authorized: false }, { reason: '' }, { amount: 0 }, { amount: -1 }, { amount: NaN }, { amount: 1.5 }, { customerId: 'missing' }, { expectedBalance: 50 }, { expectedLastEntryId: 'old' }, { kind: 'invalid' }, { method: undefined }, { id: '' }, { at: 'invalid' }]) {
    const intent = command(state, changes)
    assert.ok(credit.validateCreditCommand(state, intent))
    assert.equal(credit.registerCreditCommand(state, intent), state)
  }
})
test('registro opcional exige caixa aberto e separa digitais, gaveta e vendas', () => {
  let state = initial()
  assert.equal(credit.registerCreditCommand(state, command(state, { registerCash: true, sessionNumber: 27 })), state)
  state = { ...state, sessions: cash.openDemoSession([], 1000, '2026-11-20T09:00:00-03:00') }
  for (const method of ['Dinheiro', 'Pix', 'Crédito', 'Débito']) {
    const next = credit.registerCreditCommand(state, command(state, { registerCash: true, sessionNumber: 27, method }))
    const summary = cash.summarizeCash(next.sessions[0])
    assert.equal(summary.sales, 0)
    assert.equal(summary.creditReceipts, 2000)
    assert.equal(summary.expectedCash, method === 'Dinheiro' ? 3000 : 1000)
    assert.equal(summary.digital, method === 'Dinheiro' ? 0 : 2000)
    assert.equal(next.sessions[0].movements[1].creditEntryId, 'intent-1')
    assert.equal(next.creditEntries[0].sessionNumber, 27)
    assert.equal(credit.registerCreditCommand(next, command(next)), next)
  }
})
test('reversão mantém original, cria compensação e impede reversão repetida ou dívida negativa', () => {
  const state = initial()
  const receipt = state.creditEntries.find((entry) => entry.id === 'credit-ana-receipt')
  const intent = command(state, { kind: 'reversal', reversesId: receipt.id, amount: receipt.amount })
  const next = credit.registerCreditCommand(state, intent)
  assert.equal(credit.creditBalance(next.creditEntries, 'ana'), 8000)
  assert.equal(next.creditEntries[0].reversesId, receipt.id)
  assert.equal(next.creditEntries.find((entry) => entry.id === receipt.id), receipt)
  assert.equal(credit.registerCreditCommand(next, command(next, { ...intent, id: 'again' })), next)
  assert.equal(credit.registerCreditCommand(state, command(state, { kind: 'reversal', reversesId: 'credit-ana-opening', amount: 8000 })), state)
})
test('reverter recebimento compensa no caixa atual sem recalcular caixa encerrado', () => {
  const state = { ...initial(), sessions: cash.openDemoSession([], 0, '2026-11-20T09:00:00-03:00') }
  const paid = credit.registerCreditCommand(state, command(state, { registerCash: true, sessionNumber: 27, method: 'Pix' }))
  const original = paid.creditEntries[0]
  const closed = { ...paid.sessions[0], closedAt: '2026-11-20T18:30:00-03:00' }
  const reopened = { ...paid, sessions: cash.openDemoSession([closed], 0, '2026-11-20T19:00:00-03:00') }
  const reversal = command(reopened, { id: 'reverse-1', kind: 'reversal', reversesId: original.id, amount: original.amount, registerCash: true, sessionNumber: 28, at: '2026-11-20T19:10:00-03:00' })
  const next = credit.registerCreditCommand(reopened, reversal)
  assert.equal(credit.creditBalance(next.creditEntries, 'ana'), 6000)
  assert.equal(next.sessions.find((session) => session.number === 27), closed)
  assert.equal(cash.summarizeCash(next.sessions[0]).digital, -2000)
  assert.equal(cash.summarizeCash(next.sessions[0]).creditReceipts, -2000)
  assert.equal(next.sessions[0].movements[1].kind, 'credit-reversal')
  assert.equal(credit.registerCreditCommand(reopened, { ...reversal, registerCash: false }), reopened)
})

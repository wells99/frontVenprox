import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'

// O loader do projeto resolve os mesmos módulos TypeScript usados pela interface.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
let cash
let fixtures
try {
  cash = await server.ssrLoadModule('/src/features/cash/cashDemo.ts')
  fixtures = await server.ssrLoadModule('/src/features/sales/demoSales.ts')
} finally { await server.close() }

const at = '2026-11-20T18:00:00-03:00'
const mixedSale = {
  ...fixtures.demoSales[0], id: 'test-mixed', cashSession: 27, status: 'Concluída',
  payment: 'Misto', items: [{ name: 'Produto', quantity: 1, priceCents: 1000 }],
  payments: [
    { method: 'Dinheiro', tenderedCents: 1000, appliedCents: 400, changeCents: 600 },
    { method: 'Pix', tenderedCents: 600, appliedCents: 600, changeCents: 0 },
  ],
}

test('abertura exige centavos válidos e permite zero informado sem duplicar sessão', () => {
  for (const value of [-1, NaN, undefined, 1.5, 1000000000]) assert.deepEqual(cash.openDemoSession([], value, at), [])
  const sessions = cash.openDemoSession([], 0, at)
  assert.equal(sessions[0].number, 27)
  assert.equal(cash.summarizeCash(sessions[0]).expectedCash, 0)
  assert.equal(cash.openDemoSession(sessions, 5000, at), sessions)
  assert.equal(sessions.length, 1)
})

test('pagamento misto soma somente dinheiro aplicado à gaveta, descontando troco', () => {
  const initial = cash.openDemoSession([], 20000, at)
  const sessions = cash.registerCashSale(initial, mixedSale)
  const totals = cash.summarizeCash(sessions[0])
  assert.equal(totals.expectedCash, 20400)
  assert.equal(totals.digital, 600)
  assert.equal(totals.sales, 1000)
  assert.equal(totals.cancellations, 0)
  assert.equal(totals.withdrawals, 0)
  assert.equal(initial[0].movements.length, 1)
  assert.deepEqual(cash.registerCashSale(sessions, mixedSale), sessions)
})

test('venda preserva o instante completo para ordenar movimentos do mesmo minuto', () => {
  const sale = { ...mixedSale, recordedAt: '2026-11-20T21:00:45.123Z' }
  assert.equal(cash.saleMovement(sale).at, sale.recordedAt)
})

test('cancelamento reverte uma única vez e preserva o movimento original', () => {
  const initial = cash.registerCashSale(cash.openDemoSession([], 20000, at), mixedSale)
  const cancelled = fixtures.cancelDemoSale(mixedSale, 'Teste', true, at)
  const sessions = cash.registerCashCancellation(initial, cancelled)
  const totals = cash.summarizeCash(sessions[0])
  assert.equal(totals.expectedCash, 20000)
  assert.equal(totals.digital, 0)
  assert.equal(totals.sales - totals.cancellations, 0)
  assert.equal(sessions[0].movements.filter((movement) => movement.kind === 'sale').length, 1)
  assert.deepEqual(cash.registerCashCancellation(sessions, cancelled), sessions)
})

test('nenhuma venda ou reversão reconta sessão fechada ou entra em sessão inexistente', () => {
  const sessions = cash.createDemoSessions(fixtures.demoSales)
  const snapshot = structuredClone(sessions)
  const oldSale = { ...mixedSale, cashSession: 26 }
  assert.deepEqual(cash.registerCashSale(sessions, oldSale), snapshot)
  assert.deepEqual(cash.registerCashCancellation(sessions, fixtures.cancelDemoSale(oldSale, 'Teste', true, at)), snapshot)
  assert.deepEqual(cash.registerCashSale(sessions, mixedSale), snapshot)
  assert.deepEqual(cash.registerCashCancellation(cash.openDemoSession([], 0, at), fixtures.cancelDemoSale(mixedSale, 'Teste', true, at))[0].movements.map((movement) => movement.kind), ['opening'])
})

test('fiado, suprimento e sangria ficam separados de vendas e pagamentos digitais', () => {
  const session = cash.createDemoSessions([])[0]
  const totals = cash.summarizeCash(session)
  assert.equal(totals.expectedCash, 26000)
  assert.equal(totals.digital, 1500)
  assert.equal(totals.sales, 0)
  assert.equal(totals.creditReceipts, 4500)
  assert.equal(totals.supplies, 5000)
  assert.equal(totals.withdrawals, 2000)
})

const manual = { id: 'manual-test', sessionNumber: 27, kind: 'supply', amount: 5000, reason: ' Troco ', authorized: true, at }
test('movimentos manuais alteram somente a gaveta, preservando vendas e sessões anteriores', () => {
  const initial = cash.openDemoSession(cash.createDemoSessions([]), 20000, at)
  const supplied = cash.registerCashMovement(initial, manual)
  const sessions = cash.registerCashMovement(supplied, { ...manual, id: 'withdrawal-test', kind: 'withdrawal', amount: 3000 })
  const totals = cash.summarizeCash(sessions[0])
  assert.equal(totals.expectedCash, 22000)
  assert.equal(totals.supplies, 5000)
  assert.equal(totals.withdrawals, 3000)
  assert.equal(totals.digital, 0)
  assert.equal(totals.sales, 0)
  assert.equal(sessions[0].movements[1].description, 'Suprimento · Troco')
  assert.equal(sessions[0].movements[1].operator, cash.demoOperator)
  assert.equal(sessions[0].sync, 'Pendente')
  assert.deepEqual(sessions.slice(1), initial.slice(1))
  assert.equal(initial[0].movements.length, 1)
  assert.equal(cash.registerCashMovement(sessions, manual), sessions)
})

test('movimento exige valor positivo, motivo, permissão e sessão aberta neste terminal', () => {
  const sessions = cash.openDemoSession([], 0, at)
  const invalid = [
    ...[0, -1, NaN, 1.5, 1000000000].map((amount) => ({ amount })),
    { reason: '  ' }, { reason: 'a'.repeat(301) }, { authorized: false },
    { kind: 'sale' }, { sessionNumber: 26 }, { id: '' }, { at: 'invalid' },
  ]
  for (const change of invalid) {
    assert.ok(cash.validateCashMovement(sessions, { ...manual, ...change }))
    assert.equal(cash.registerCashMovement(sessions, { ...manual, ...change }), sessions)
  }
  for (const session of [{ ...sessions[0], closedAt: at }, { ...sessions[0], terminal: 'Outro terminal' }]) {
    const list = [session]
    assert.equal(cash.registerCashMovement(list, manual), list)
  }
  assert.deepEqual(cash.registerCashMovement([], manual), [])
})

const closingCommand = (session, changes = {}) => ({ id: 'closing-test', sessionNumber: session.number, counted: { ...cash.summarizeCash(session).byMethod }, reason: '', authorized: true, at, movementIds: session.movements.map((movement) => movement.id), ...changes })
test('fechamento preserva movimentos e conferência por meio, impede repetição e libera nova abertura', () => {
  const initial = cash.registerCashSale(cash.openDemoSession([], 20000, at), mixedSale)
  const command = closingCommand(initial[0], { counted: { Dinheiro: 20300, Crédito: 0, Débito: 0, Pix: 500 }, reason: ' Diferença nos registros ' })
  const closed = cash.closeDemoSession(initial, command)
  assert.equal(closed[0].closedAt, at)
  assert.equal(closed[0].sync, 'Pendente')
  assert.equal(closed[0].countedCashCents, 20300)
  assert.equal(closed[0].closing.expected.Dinheiro, 20400)
  assert.equal(closed[0].closing.expected.Pix, 600)
  assert.equal(closed[0].closing.counted.Pix, 500)
  assert.equal(closed[0].closing.reason, 'Diferença nos registros')
  assert.deepEqual(closed[0].movements, initial[0].movements)
  assert.equal(initial[0].closedAt, undefined)
  assert.equal(cash.closeDemoSession(closed, command), closed)
  command.counted.Pix = 0
  assert.equal(closed[0].closing.counted.Pix, 500)
  const cancelled = fixtures.cancelDemoSale(mixedSale, 'Cancelamento posterior', true, at)
  assert.deepEqual(cash.registerCashCancellation(closed, cancelled), closed)
  assert.deepEqual(cash.registerCashSale(closed, { ...mixedSale, id: 'late-sale' }), closed)
  assert.equal(cash.registerCashMovement(closed, manual), closed)
  const next = cash.openDemoSession(closed, 0, at)
  assert.equal(next[0].number, 28)
  assert.deepEqual(next[1], closed[0])
})

test('fechamento exige valores explícitos, motivo para qualquer diferença e sessão válida', () => {
  const sessions = cash.openDemoSession([], 0, at)
  const command = closingCommand(sessions[0])
  for (const value of [undefined, NaN, -1, 1.5, 1000000000]) {
    const invalid = { ...command, counted: { ...command.counted, Pix: value } }
    assert.ok(cash.validateCashClosing(sessions, invalid))
    assert.equal(cash.closeDemoSession(sessions, invalid), sessions)
  }
  for (const changes of [{ counted: { ...command.counted, Pix: 1 } }, { counted: { ...command.counted, Dinheiro: 1 } }, { authorized: false }, { sessionNumber: 99 }, { reason: 'a'.repeat(301) }, { movementIds: [] }, { at: 'invalid' }, { at: '2026-11-19T10:00:00Z' }, { id: '' }]) {
    assert.ok(cash.validateCashClosing(sessions, { ...command, ...changes }))
    assert.equal(cash.closeDemoSession(sessions, { ...command, ...changes }), sessions)
  }
  assert.equal(cash.validateCashClosing(sessions, command), undefined)
  assert.ok(cash.closeDemoSession(sessions, command)[0].closedAt)
  const changed = cash.registerCashMovement(sessions, manual)
  assert.equal(cash.closeDemoSession(changed, command), changed)
  const otherTerminal = [{ ...sessions[0], terminal: 'Outro terminal' }]
  assert.equal(cash.closeDemoSession(otherTerminal, command), otherTerminal)
})

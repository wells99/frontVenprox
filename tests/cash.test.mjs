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

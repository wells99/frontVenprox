import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
let model
try { model = await server.ssrLoadModule('/src/features/products/stockDemo.ts') } finally { await server.close() }
const state = { products: [{ id: 'p', name: 'Produto', code: 'P', unit: 'UN', active: true, stock: -2, priceCents: 100 }], movements: [] }
const command = { id: 'm1', productId: 'p', kind: 'entry', quantity: 5, expectedStock: -2, reason: 'Reposição', authorized: true, at: '2026-11-20T19:00:00-03:00' }
test('entrada atualiza saldo e histórico uma única vez, sem alterar a base', () => {
  const next = model.registerStockMovement(state, command)
  assert.equal(next.products[0].stock, 3)
  assert.equal(next.movements[0].delta, 5)
  assert.equal(next.movements[0].before, -2)
  assert.equal(next.movements[0].after, 3)
  assert.equal(next.movements[0].reason, 'Reposição')
  assert.equal(state.products[0].stock, -2)
  assert.equal(model.registerStockMovement(next, command), next)
})
test('ajuste absoluto registra diferença auditável, permite zero e negativo', () => {
  for (const [quantity, delta] of [[0, 2], [-5, -3], [1.125, 3.125]]) {
    const next = model.registerStockMovement(state, { ...command, kind: 'adjustment', quantity })
    assert.equal(next.products[0].stock, quantity)
    assert.equal(next.movements[0].delta, delta)
    assert.equal(next.movements[0].kind, 'adjustment')
  }
})
test('permissão, motivo, quantidade e saldo atual são exigidos sem gerar movimento', () => {
  for (const invalid of [{ authorized: false }, { reason: '  ' }, { quantity: NaN }, { quantity: 0 }, { quantity: -1 }, { quantity: 1.2345 }, { expectedStock: 5 }, { productId: 'missing' }, { costCents: -1 }, { costCents: 1.2 }, { quantity: 1000000 }]) {
    const value = { ...command, ...invalid }
    assert.ok(model.validateStockMovement(state, value))
    assert.equal(model.registerStockMovement(state, value), state)
  }
  assert.equal(model.registerStockMovement(state, { ...command, kind: 'adjustment', quantity: -2 }), state)
})
test('custo zero é conhecido; não informar preserva custo existente', () => {
  const next = model.registerStockMovement(state, { ...command, costCents: 0 })
  assert.equal(next.products[0].costCents, 0)
  assert.equal(next.movements[0].costCents, 0)
  const last = model.registerStockMovement(next, { ...command, id: 'm2', expectedStock: 3, quantity: 0.1 })
  assert.equal(last.products[0].stock, 3.1)
  assert.equal(last.products[0].costCents, 0)
  assert.equal(last.movements[0].costCents, undefined)
})

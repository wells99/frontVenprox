import type { CatalogProduct } from './productDemo'
export type StockMovement = { id: string; productId: string; productName: string; unit: string; kind: 'entry' | 'adjustment'; before: number; after: number; delta: number; reason: string; costCents?: number; operator: string; at: string }
export type StockState = { products: CatalogProduct[]; movements: StockMovement[] }
export type StockCommand = { id: string; productId: string; kind: 'entry' | 'adjustment'; quantity: number; expectedStock: number; costCents?: number; reason: string; authorized: boolean; at: string }
export function validateStockMovement(state: StockState, command: StockCommand): string | undefined {
  if (state.movements.some((item) => item.id === command.id)) return 'Este movimento já foi registrado.'
  const product = state.products.find((item) => item.id === command.productId)
  if (!product) return 'Selecione um produto cadastrado.'
  if (!command.authorized) return 'Permissão simulada negada. Nenhum saldo foi alterado.'
  if (!command.reason.trim()) return 'Informe o motivo do movimento.'
  if (!Number.isFinite(command.quantity) || Math.abs(command.quantity) > 999999 || Math.abs(command.quantity * 1000 - Math.round(command.quantity * 1000)) > 0.00001) return 'Informe uma quantidade válida com até três casas decimais.'
  if (command.kind === 'entry' && command.quantity <= 0) return 'A entrada deve ter quantidade positiva.'
  if (command.expectedStock !== product.stock) return 'O saldo mudou. Feche e abra novamente para conferir o saldo atual.'
  if (command.kind === 'adjustment' && command.quantity === product.stock) return 'O novo saldo deve ser diferente do saldo atual.'
  if (command.costCents !== undefined && (!Number.isSafeInteger(command.costCents) || command.costCents < 0 || command.costCents > 999999999)) return 'Informe um custo válido ou deixe como desconhecido.'
  const after = command.kind === 'entry' ? product.stock + command.quantity : command.quantity
  if (Math.abs(after) > 999999) return 'O saldo resultante excede o limite da demonstração.'
}
export function registerStockMovement(state: StockState, command: StockCommand): StockState {
  if (validateStockMovement(state, command)) return state
  const product = state.products.find((item) => item.id === command.productId)!
  const after = Math.round((command.kind === 'entry' ? product.stock + command.quantity : command.quantity) * 1000) / 1000
  const movement: StockMovement = { id: command.id, productId: product.id, productName: product.name, unit: product.unit, kind: command.kind, before: product.stock, after, delta: Math.round((after - product.stock) * 1000) / 1000, reason: command.reason.trim(), costCents: command.costCents, operator: 'Operadora demonstração', at: command.at }
  return { products: state.products.map((item) => item.id === product.id ? { ...item, stock: after, costCents: command.costCents ?? item.costCents, version: (item.version ?? 0) + 1 } : item), movements: [movement, ...state.movements] }
}
export const quantityText = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

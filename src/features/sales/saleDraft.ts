export type Product = { id: string; code: string; name: string; priceCents: number; stock: number }
export type DraftItem = { id: string; productId?: string; name: string; quantity: number; priceCents: number }
export const catalog: Product[] = [
  { id: 'water', code: '7891000000011', name: 'Água mineral 500 ml', priceCents: 250, stock: 25 },
  { id: 'coffee', code: 'CAFE', name: 'Café', priceCents: 350, stock: 0 },
  { id: 'chocolate', code: '7891000000028', name: 'Chocolate ao leite', priceCents: 450, stock: 12 },
  { id: 'cookies', code: 'BISCOITO', name: 'Biscoito recheado', priceCents: 390, stock: 8 },
  { id: 'soda', code: 'REFRI', name: 'Refrigerante lata', priceCents: 600, stock: 3 },
  { id: 'icecream', code: 'SORVETE', name: 'Sorvete de castanha', priceCents: 1800, stock: 6 },
  { id: 'snack', code: 'SALGADO', name: 'Salgado', priceCents: 500, stock: -2 },
  { id: 'juice', code: 'SUCO', name: 'Suco de laranja', priceCents: 700, stock: 10 },
]

// Valores monetários em centavos; aceita vírgula ou ponto decimal, sem milhar.
export function parseMoney(value: string): number | undefined {
  if (!/^\d{1,7}([,.]\d{1,2})?$/.test(value.trim())) return undefined
  const [whole, fraction = ''] = value.trim().replace(',', '.').split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}
export const moneyInput = (cents: number) => (cents / 100).toFixed(2).replace('.', ',')
export const subtotalOf = (items: DraftItem[]) => items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0)
export function validateDraft(items: DraftItem[], discount: string, requireStock: boolean, products: Product[] = catalog): string | undefined {
  if (!items.length) return 'Adicione pelo menos um item à venda.'
  if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999)) return 'Use quantidades inteiras entre 1 e 999.'
  const discountCents = parseMoney(discount)
  if (discountCents === undefined) return 'Informe um desconto válido, como 2,50.'
  if (discountCents >= subtotalOf(items)) return 'O desconto deve ser menor que o subtotal da venda.'
  if (requireStock) {
    if (items.some((item) => !item.productId)) return 'O modo de estoque obrigatório não permite itens avulsos. Remova-os ou volte ao modo permissivo.'
    for (const product of products) {
      const quantity = items.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0)
      if (quantity > Math.max(0, product.stock)) return 'Estoque insuficiente para ' + product.name + '. Disponível: ' + Math.max(0, product.stock) + '.'
    }
  }
}

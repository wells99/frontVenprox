export type PaymentMethod = 'Dinheiro' | 'Pix' | 'Crédito' | 'Débito'
export type Sale = {
  id: string
  number: number
  date: string
  time: string
  items: { name: string; quantity: number; priceCents: number }[]
  payment: PaymentMethod
  customer: string
  operator: string
  cashSession: number
  status: 'Concluída' | 'Cancelada'
  sync: 'Recebida' | 'Pendente'
}

// Massa fixa e inteiramente fictícia para validar T01 sem banco ou integração.
const products = [
  [{ name: 'Água mineral 500 ml', quantity: 2, priceCents: 250 }, { name: 'Sorvete de castanha', quantity: 1, priceCents: 1800 }],
  [{ name: 'Café', quantity: 1, priceCents: 350 }],
  [{ name: 'Chocolate ao leite', quantity: 2, priceCents: 450 }],
  [{ name: 'Biscoito recheado', quantity: 1, priceCents: 390 }, { name: 'Água mineral 500 ml', quantity: 1, priceCents: 250 }],
  [{ name: 'Refrigerante lata', quantity: 2, priceCents: 600 }],
  [{ name: 'Item avulso — salgadinho', quantity: 1, priceCents: 500 }],
]
const methods: PaymentMethod[] = ['Dinheiro', 'Pix', 'Crédito', 'Débito']
export const demoSales: Sale[] = Array.from({ length: 24 }, (_, index) => ({
  id: 'demo-' + (1048 - index),
  number: 1048 - index,
  date: index < 16 ? '2026-11-20' : '2026-11-19',
  time: String(18 - Math.floor((index % 16) / 2)).padStart(2, '0') + ':' + (index % 2 ? '10' : '35'),
  items: products[index % products.length],
  payment: methods[index % methods.length],
  customer: index % 4 === 1 ? 'Cliente demonstração' : '',
  operator: index % 3 ? 'Operador exemplo' : 'Administrador exemplo',
  cashSession: index < 16 ? 26 : 25,
  status: index === 7 || index === 20 ? 'Cancelada' : 'Concluída',
  sync: index < 3 ? 'Pendente' : 'Recebida',
}))
export const totalCents = (sale: Sale) => sale.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
export const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const dateLabel = (value: string) => value.split('-').reverse().join('/')
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

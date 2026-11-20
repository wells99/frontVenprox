import { catalog } from '../sales/saleDraft'
import type { Product } from '../sales/saleDraft'

export type CatalogProduct = Product & { barcode?: string; category?: string; costCents?: number; unit: string; active: boolean }

// Preço e saldo dos produtos já vendidos vêm da mesma base da T02.
// Cadastro/edição e persistência serão conectados nas etapas seguintes.
const details: Record<string, { barcode?: string; category?: string; costCents?: number }> = {
  water: { barcode: '7891000000011', category: 'Bebidas', costCents: 120 },
  coffee: { category: 'Bebidas', costCents: 100 },
  chocolate: { barcode: '7891000000028', category: 'Doces', costCents: 280 },
  cookies: { barcode: '7891000000035', category: 'Doces', costCents: 210 },
  soda: { barcode: '7891000000042', category: 'Bebidas', costCents: 350 },
  icecream: { category: 'Doces', costCents: 1100 },
  snack: { category: 'Salgados' },
  juice: { category: 'Bebidas' },
}
export const demoProducts: CatalogProduct[] = [
  ...catalog.map((product) => ({ ...product, ...details[product.id], unit: 'UN', active: true })),
  { id: 'napkin', name: 'Guardanapo avulso', code: 'GUARDANAPO', priceCents: 50, stock: 30, costCents: 0, unit: 'UN', active: true },
  { id: 'tea', name: 'Chá gelado 300 ml', code: 'CHA300', barcode: '7891000000059', priceCents: 650, stock: 0, category: 'Bebidas', unit: 'UN', active: false },
]
export const productCategories = ['Bebidas', 'Doces', 'Salgados']

import type { SVGProps } from 'react'

// Único catálogo de desenhos. Trocar um símbolo aqui atualiza todas as telas.
const shapes = {
  menu: <path d="M5 7h14M5 12h14M5 17h14" />,
  sales: <><circle cx="12" cy="12" r="9" /><path d="M15 8.5h-4.5a2 2 0 0 0 0 4H13a2 2 0 0 1 0 4H8.5M12 6v12" /></>,
  customers: <><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  products: <><path d="m3 12 9-9h8v8l-9 10-8-9Z" /><circle cx="16.5" cy="6.5" r=".8" /></>,
  stock: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M9 5v5m6-5v5M9 14h6" /></>,
  bills: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 7v10m3-10v10m4-10v6m3-6v10" /></>,
  cash: <><rect x="4" y="8" width="16" height="13" rx="2" /><path d="M9 8V3h6v5M8 12h8m-8 4h8" /></>,
  reports: <path d="M4 20V11m5 9V5m5 15V9m5 11V3" />,
  settings: <><path d="m9 3-.7 2.4-2.2 1-.7 2.4L3 10v4l2.4 1.2.7 2.4 2.2 1L9 21h6l.7-2.4 2.2-1 .7-2.4L21 14v-4l-2.4-1.2-.7-2.4-2.2-1L15 3H9Z" /><circle cx="12" cy="12" r="3" /></>,
  add: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  cart: <><path d="M2 3h3l3 13h11l3-9H6M9 7V4m7 3V4" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
  money: <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M5 9v6m14-6v6" /></>,
  card: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20M6 15h4" /></>,
  pix: <><path d="m12 2 10 10-10 10L2 12 12 2Z" /><path d="m5 9 3 3 4-4 4 4 3-3M5 15l3-3m8 0 3 3" /></>,
  mixed: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 8h10m-3-3 3 3-3 3M17 16H7m3-3-3 3 3 3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  printer: <><path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 14h10v7H7zM16 11h1" /></>,
}
export type IconName = keyof typeof shapes
export function AppIcon({ name, size = 22, className = '', ...props }: Omit<SVGProps<SVGSVGElement>, 'name'> & { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={'app-icon ' + className} {...props}>{shapes[name]}</svg>
}
type PaymentIconMethod = 'Dinheiro' | 'Crédito' | 'Débito' | 'Pix' | 'Misto'
// Crédito e débito compartilham o mesmo desenho; o histórico e o modal usam este mapa.
const paymentIcons: Record<PaymentIconMethod, { name: IconName; tone: string }> = {
  Dinheiro: { name: 'money', tone: 'cash' },
  Crédito: { name: 'card', tone: 'card' },
  Débito: { name: 'card', tone: 'card' },
  Pix: { name: 'pix', tone: 'pix' },
  Misto: { name: 'mixed', tone: 'mixed' },
}
export function PaymentIcon({ method, size = 22 }: { method: PaymentIconMethod; size?: number }) {
  const icon = paymentIcons[method]
  return <AppIcon name={icon.name} size={size} className={'payment-icon payment-icon--' + icon.tone} />
}

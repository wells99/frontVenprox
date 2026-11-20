import type { NavigationIconName } from './navigation'
export function NavigationIcon({ name }: { name: NavigationIconName }) {
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
  }
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name]}</svg>
}

import { useEffect, useRef, useState } from 'react'
import { AppIcon } from '../../ui/AppIcon'
import { money } from '../sales/demoSales'
import { collectReminderNotices, localReminderNow } from './reminderDemo'
import type { ReminderOccurrence } from './reminderDemo'
export function ReminderNotice({ occurrences, route, onView }: { occurrences: ReminderOccurrence[]; route: string; onView: (id: string) => void }) {
  const seen = useRef(new Set<string>())
  const [notice, setNotice] = useState<ReminderOccurrence[]>([])
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === 'hidden' || document.querySelector('dialog[open]') || route.startsWith('/vendas/nova')) return
      const next = collectReminderNotices(occurrences,localReminderNow(),seen.current)
      if (!next.due.length) return
      next.keys.forEach((key) => seen.current.add(key)); setNotice((previous) => [...previous.filter((old) => occurrences.some((current) => current.id === old.id && current.dueAt === old.dueAt && current.status === 'pending')), ...next.due])
    }
    check(); const timer = setInterval(check,10000)
    window.addEventListener('focus',check); document.addEventListener('visibilitychange',check)
    return () => { clearInterval(timer); window.removeEventListener('focus',check); document.removeEventListener('visibilitychange',check) }
  }, [occurrences, route])
  const pending = notice.filter((item) => occurrences.some((current) => current.id === item.id && current.dueAt === item.dueAt && current.status === 'pending'))
  if (!pending.length || route.startsWith('/vendas/nova')) return null
  return <aside className="reminder-toast" aria-label="Lembrete de contas"><div role="status"><strong>{pending.length === 1 ? pending[0].description : pending.length + ' lembretes vencidos'}</strong><p>{money(pending.reduce((sum,item) => sum + item.amountCents,0))} · valor informativo. O caixa não foi alterado.</p></div><div><button className="sales-text-button" onClick={() => { onView(pending[0].id); setNotice([]) }}>Ver conta</button><button aria-label="Dispensar aviso de contas" className="dialog-close" onClick={() => setNotice([])}><AppIcon name="close" size={16} /></button></div></aside>
}

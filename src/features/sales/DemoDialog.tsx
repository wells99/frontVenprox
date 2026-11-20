import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AppIcon } from '../../ui/AppIcon'

export function DemoDialog({ title, children, onClose, locked = false, className = '', eyebrow = 'Demonstração · sem pagamento real' }: { title: string; children: ReactNode; onClose: () => void; locked?: boolean; className?: string; eyebrow?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-initial-focus]')?.focus()
    return () => dialog.close()
  }, [])
  return <dialog ref={ref} className={'sales-dialog ' + className} aria-label={title} onCancel={(event) => { event.preventDefault(); if (!locked) onClose() }} onKeyDown={(event) => {
    if (event.key !== 'Tab' || event.defaultPrevented) return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, summary, [tabindex]'))
      .filter((element) => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0)
    const target = event.shiftKey ? controls.at(-1) : controls[0]
    if (!controls.length || document.activeElement === (event.shiftKey ? controls[0] : controls.at(-1))) {
      event.preventDefault()
      target?.focus()
    }
  }}>
    <div className="sale-dialog-heading"><div><span className="dialog-eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="dialog-close" type="button" aria-label={'Fechar ' + title} disabled={locked} onClick={onClose}><AppIcon name="close" /></button></div>
    {children}
  </dialog>
}

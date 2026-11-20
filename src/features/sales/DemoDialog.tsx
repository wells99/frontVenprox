import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AppIcon } from '../../ui/AppIcon'

export function DemoDialog({ title, children, onClose, locked = false, className = '' }: { title: string; children: ReactNode; onClose: () => void; locked?: boolean; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-initial-focus]')?.focus()
    return () => dialog.close()
  }, [])
  return <dialog ref={ref} className={'sales-dialog ' + className} aria-label={title} onCancel={(event) => { event.preventDefault(); if (!locked) onClose() }}>
    <div className="sale-dialog-heading"><div><span className="dialog-eyebrow">Demonstração · sem pagamento real</span><h2>{title}</h2></div><button className="dialog-close" type="button" aria-label={'Fechar ' + title} disabled={locked} onClick={onClose}><AppIcon name="close" /></button></div>
    {children}
  </dialog>
}

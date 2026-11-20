import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { navigation, type SectionId } from './navigation'
import { AppIcon } from './ui/AppIcon'
import './App.css'
import { SalesHistory } from './features/sales/SalesHistory'
import { NewSale } from './features/sales/NewSale'
import { cancelDemoSale, demoSales } from './features/sales/demoSales'
import type { Sale } from './features/sales/demoSales'
import { CashPage } from './features/cash/CashPage'
import { ProductsPage } from './features/products/ProductsPage'
import { CloseCashDialog } from './features/cash/CloseCashDialog'
import { CashMovementDialog } from './features/cash/CashMovementDialog'
import type { ManualCashKind } from './features/cash/cashDemo'
import { OpenCashDialog } from './features/cash/OpenCashDialog'
import { createDemoSessions, demoTerminal, openDemoSession, registerCashCancellation, registerCashSale, registerCashMovement, closeDemoSession, validateCashClosing } from './features/cash/cashDemo'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
function getRoute() { return window.location.hash.slice(1) || '/vendas' }
export default function App() {
  const route = useSyncExternalStore(subscribe, getRoute)
  const section = route.replace(/^\//, '').split('/')[0]
  const activeId: SectionId = navigation.find((item) => item.id === section)?.id ?? 'vendas'
  const [collapsed, setCollapsed] = useState(false)
  const [demo, setDemo] = useState(() => ({ sales: demoSales, sessions: createDemoSessions(demoSales) }))
  const { sales, sessions } = demo
  const [feedback, setFeedback] = useState('')
  const [cashMovement, setCashMovement] = useState<{ kind: ManualCashKind; sessionNumber: number } | null>(null)
  const [closingSession, setClosingSession] = useState<number | null>(null)
  const [cashFeedback, setCashFeedback] = useState('')
  const movementVisible = activeId === 'caixa' && route === '/caixa' && cashMovement !== null
  useEffect(() => {
    const clearMovement = () => { setCashMovement(null); setClosingSession(null) }
    window.addEventListener('hashchange', clearMovement)
    return () => window.removeEventListener('hashchange', clearMovement)
  }, [])
  const newSaleActive = activeId === 'vendas' && route.startsWith('/vendas/nova')
  const currentSession = sessions.find((session) => !session.closedAt && session.terminal === demoTerminal)
  const openingFromSale = newSaleActive && !currentSession && (route === '/vendas/nova' || route === '/vendas/nova/abertura')
  const openingFromCash = activeId === 'caixa' && route === '/caixa/abertura' && !currentSession
  const cashOpening = openingFromSale || openingFromCash
  const openingReturnFocus = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (cashOpening || !openingReturnFocus.current) return
    const target = openingReturnFocus.current
    openingReturnFocus.current = undefined
    const frame = window.requestAnimationFrame(() => document.getElementById(target)?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [cashOpening, route])
  function updateSales(update: (previous: Sale[]) => Sale[]) {
    setDemo((previous) => ({ ...previous, sales: update(previous.sales) }))
  }
  function completeSale(sale: Sale) {
    setDemo((previous) => {
      if (previous.sales.some((item) => item.id === sale.id) || !previous.sessions.some((session) => session.number === sale.cashSession && !session.closedAt && session.terminal === demoTerminal)) return previous
      return { sales: [sale, ...previous.sales], sessions: registerCashSale(previous.sessions, sale) }
    })
    setFeedback('Venda de demonstração #' + sale.number + ' adicionada ao histórico. Nenhum pagamento real foi processado.')
  }
  function recordPrint(id: string) {
    updateSales((previous) => previous.map((sale) => sale.id === id ? { ...sale, printCount: (sale.printCount ?? 0) + 1 } : sale))
  }
  function finishOpening(amount: number) {
    openingReturnFocus.current = openingFromSale ? undefined : 'cash-title'
    setDemo((previous) => ({ ...previous, sessions: openDemoSession(previous.sessions, amount, new Date().toISOString()) }))
    window.location.replace(openingFromSale ? '#/vendas/nova' : '#/caixa')
  }
  function cancelOpening() {
    openingReturnFocus.current = openingFromSale ? 'new-sale-button' : 'open-cash-button'
    window.location.replace(openingFromSale ? '#/vendas' : '#/caixa')
  }
  function closeMovement() {
    const target = cashMovement?.kind === 'supply' ? 'cash-supply-button' : 'cash-withdrawal-button'
    setCashMovement(null)
    window.requestAnimationFrame(() => document.getElementById(target)?.focus())
  }
  const active = navigation.find((item) => item.id === activeId)!
  return (
    <div className={'app-shell' + (collapsed ? ' app-shell--collapsed' : '')}>
      <a className="skip-link" href="#conteudo" onClick={(event) => { event.preventDefault(); document.getElementById('conteudo')?.focus() }}>Ir para o conteúdo</a>
      <aside className="sidebar" aria-label="Barra lateral">
        <div className="sidebar-header">
          <button className="menu-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} aria-expanded={!collapsed} aria-controls="menu-principal"><AppIcon name="menu" /></button>
          <span className="wordmark" aria-hidden={collapsed}>Venprox</span>
        </div>
        <nav className="navigation" id="menu-principal" aria-label="Menu principal">
          {navigation.map((item) => (
            <a key={item.id} href={'#/' + item.id} className={'navigation-link' + (item.id === activeId ? ' is-active' : '') + (item.id === 'configuracoes' ? ' navigation-link--settings' : '')} aria-current={item.id === activeId ? 'page' : undefined} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined}>
              <AppIcon name={item.icon} /><span className="navigation-label">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-footer" aria-label="Venprox"><span className="brand-symbol" aria-hidden="true">V</span><span className="brand-caption">Venprox</span></div>
      </aside>
      <main className="workspace" id="conteudo" tabIndex={-1} aria-label={active.label}>
        {activeId !== 'vendas' && activeId !== 'caixa' && activeId !== 'produtos' && <h1 className="visually-hidden">{active.label}</h1>}
        <ProductsPage active={activeId === 'produtos'} />
        {activeId === 'vendas' && !newSaleActive && feedback && <div className="sale-feedback" role="status"><span>{feedback}</span><button aria-label="Fechar mensagem" onClick={() => setFeedback('')}><AppIcon name="close" size={18} /></button></div>}
        <SalesHistory active={activeId === 'vendas' && !newSaleActive} route={route} sales={sales} onCancel={(id, reason, authorized) => {
          const at = new Date().toISOString()
          setDemo((previous) => {
            const original = previous.sales.find((sale) => sale.id === id)
            if (!original) return previous
            const cancelled = cancelDemoSale(original, reason, authorized, at)
            if (cancelled === original) return previous
            return { sales: previous.sales.map((sale) => sale.id === id ? cancelled : sale), sessions: registerCashCancellation(previous.sessions, cancelled) }
          })
        }} onPrint={recordPrint} />
        <NewSale active={newSaleActive} route={route} sales={sales} cashSession={currentSession} opening={cashOpening} onOpenCash={() => { window.location.hash = '/vendas/nova/abertura' }} nextNumber={Math.max(...sales.map((sale) => sale.number)) + 1} onComplete={completeSale} onPrint={recordPrint} onSync={(id, sync) => updateSales((previous) => previous.map((sale) => sale.id === id ? { ...sale, sync } : sale))} />
        {activeId === 'caixa' && cashFeedback && <div className="sale-feedback" role="status"><span>{cashFeedback}</span><button aria-label="Fechar mensagem" onClick={() => setCashFeedback('')}><AppIcon name="close" size={18} /></button></div>}
        <CashPage key={sessions.find((session) => session.closing)?.closing?.id ?? 'cash'} active={activeId === 'caixa'} route={route} sessions={sessions} onClosing={() => { if (currentSession) { setCashFeedback(''); setClosingSession(currentSession.number) } }} onMovement={(kind) => { if (currentSession) { setCashFeedback(''); setCashMovement({ kind, sessionNumber: currentSession.number }) } }} onOpen={() => { window.location.hash = '/caixa/abertura' }} />
        {movementVisible && currentSession?.number === cashMovement.sessionNumber && <CashMovementDialog session={currentSession} initialKind={cashMovement.kind} onClose={closeMovement} onConfirm={(command) => {
          setDemo((previous) => ({ ...previous, sessions: registerCashMovement(previous.sessions, command) }))
          setCashFeedback((command.kind === 'supply' ? 'Suprimento de demonstração registrado' : 'Sangria de demonstração registrada') + ' no caixa #' + command.sessionNumber + '. Dados apenas em memória.')
          closeMovement()
        }} />}
        {activeId === 'caixa' && route === '/caixa' && closingSession !== null && currentSession?.number === closingSession && <CloseCashDialog session={currentSession} onClose={() => {
          setClosingSession(null)
          window.requestAnimationFrame(() => document.getElementById('close-cash-button')?.focus())
        }} onConfirm={(command) => {
          const error = validateCashClosing(sessions, command)
          if (error) return error
          setDemo((previous) => ({ ...previous, sessions: closeDemoSession(previous.sessions, command) }))
          setClosingSession(null)
          setCashFeedback('Caixa #' + command.sessionNumber + ' fechado na demonstração; envio pendente simulado. Sem gravação local ou conciliação online.')
          window.location.hash = '/caixa/anteriores/' + command.sessionNumber
          window.requestAnimationFrame(() => document.getElementById('cash-title')?.focus())
        }} />}
        {cashOpening && <OpenCashDialog origin={openingFromSale ? 'sale' : 'cash'} onOpen={finishOpening} onClose={cancelOpening} />}
      </main>
      <div className="visually-hidden" role="status" aria-live="polite">Seção {active.label} selecionada</div>
    </div>
  )
}

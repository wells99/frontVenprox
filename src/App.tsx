import { useState, useSyncExternalStore } from 'react'
import { navigation, type SectionId } from './navigation'
import { AppIcon } from './ui/AppIcon'
import './App.css'
import { SalesHistory } from './features/sales/SalesHistory'
import { NewSale } from './features/sales/NewSale'
import { demoSales } from './features/sales/demoSales'
import type { Sale } from './features/sales/demoSales'

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
  const [sales, setSales] = useState(demoSales)
  const [feedback, setFeedback] = useState('')
  const newSaleActive = activeId === 'vendas' && route.startsWith('/vendas/nova')
  function completeSale(sale: Sale) {
    setSales((previous) => previous.some((item) => item.id === sale.id) ? previous : [sale, ...previous])
    setFeedback('Venda de demonstração #' + sale.number + ' adicionada ao histórico. Nenhum pagamento real foi processado.')
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
        {activeId !== 'vendas' && <h1 className="visually-hidden">{active.label}</h1>}
        {activeId === 'vendas' && !newSaleActive && feedback && <div className="sale-feedback" role="status"><span>{feedback}</span><button aria-label="Fechar mensagem" onClick={() => setFeedback('')}><AppIcon name="close" size={18} /></button></div>}
        <SalesHistory active={activeId === 'vendas' && !newSaleActive} route={route} sales={sales} />
        <NewSale active={newSaleActive} route={route} nextNumber={Math.max(...sales.map((sale) => sale.number)) + 1} onComplete={completeSale} />
      </main>
      <div className="visually-hidden" role="status" aria-live="polite">Seção {active.label} selecionada</div>
    </div>
  )
}

import { useState, useSyncExternalStore } from 'react'
import { navigation, type SectionId } from './navigation'
import { NavigationIcon } from './NavigationIcon'
import './App.css'
import { SalesHistory } from './features/sales/SalesHistory'

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
  const active = navigation.find((item) => item.id === activeId)!
  return (
    <div className={'app-shell' + (collapsed ? ' app-shell--collapsed' : '')}>
      <a className="skip-link" href="#conteudo" onClick={(event) => { event.preventDefault(); document.getElementById('conteudo')?.focus() }}>Ir para o conteúdo</a>
      <aside className="sidebar" aria-label="Barra lateral">
        <div className="sidebar-header">
          <button className="menu-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} aria-expanded={!collapsed} aria-controls="menu-principal"><NavigationIcon name="menu" /></button>
          <span className="wordmark" aria-hidden={collapsed}>Venprox</span>
        </div>
        <nav className="navigation" id="menu-principal" aria-label="Menu principal">
          {navigation.map((item) => (
            <a key={item.id} href={'#/' + item.id} className={'navigation-link' + (item.id === activeId ? ' is-active' : '') + (item.id === 'configuracoes' ? ' navigation-link--settings' : '')} aria-current={item.id === activeId ? 'page' : undefined} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined}>
              <NavigationIcon name={item.icon} /><span className="navigation-label">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-footer" aria-label="Venprox"><span className="brand-symbol" aria-hidden="true">V</span><span className="brand-caption">Venprox</span></div>
      </aside>
      <main className="workspace" id="conteudo" tabIndex={-1} aria-label={active.label}>
        {activeId !== 'vendas' && <h1 className="visually-hidden">{active.label}</h1>}
        <SalesHistory active={activeId === 'vendas'} route={route} />
      </main>
      <div className="visually-hidden" role="status" aria-live="polite">Seção {active.label} selecionada</div>
    </div>
  )
}

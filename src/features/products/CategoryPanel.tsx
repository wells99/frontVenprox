import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import type { CatalogProduct } from './productDemo'
import './editor.css'
export type Category = { id: string; name: string; active: boolean }
export type SaveCategory = (category: Category) => string | undefined
export function CategoryPanel({ categories, products, onSave, onClose }: { categories: Category[]; products: CatalogProduct[]; onSave: SaveCategory; onClose: () => void }) {
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [fail, setFail] = useState(false)
  const [notice, setNotice] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  useEffect(() => () => clearTimeout(timer.current), [])
  function save(category: Category) {
    if (lock.current) return
    if (!category.name.trim()) { setError('Informe o nome da categoria.'); document.getElementById('category-name')?.focus(); return }
    lock.current = true; setBusy(true); setError('')
    timer.current = window.setTimeout(() => {
      const message = fail ? 'Falha simulada. Nenhuma categoria alterada; tente novamente.' : onSave({ ...category, name: category.name.trim() })
      setBusy(false); lock.current = false
      if (message) setError(message)
      else { setNotice('Categoria atualizada na demonstração.'); setName(''); setEditing(null) }
    }, 400)
  }
  return <DemoDialog title="Gerenciar categorias" eyebrow="Categorias · demonstração em memória" onClose={onClose} locked={busy} className="catalog-dialog">
    <form onSubmit={(event) => { event.preventDefault(); save({ id: editing?.id ?? crypto.randomUUID(), name, active: editing?.active ?? true }) }}>
      <fieldset className="editor-body" disabled={busy}>
        <p className="editor-hint">Inativar mantém os produtos vinculados e o histórico. Sem categoria continua disponível.</p>
        <label>{editing ? 'Editar nome da categoria' : 'Nome da nova categoria'}<input id="category-name" data-initial-focus maxLength={60} value={name} aria-invalid={!!error} aria-describedby={error ? 'category-error' : undefined} onChange={(event) => { setName(event.target.value); setError('') }} /></label>
        <div className="products-intro"><button className="sales-primary">{editing ? 'Salvar categoria' : 'Criar categoria'}</button>{editing && <button type="button" className="sales-secondary" onClick={() => { setEditing(null); setName(''); setError('') }}>Cancelar edição</button>}</div>
        <ul className="category-list"><li><span>Sem categoria<small>{products.filter((item) => !item.category).length} produtos · opção permanente</small></span></li>{categories.map((category) => <li key={category.id}><span>{category.name}<small>{category.active ? 'Ativa' : 'Inativa'} · {products.filter((item) => item.category === category.name).length} produtos</small></span><button type="button" className="sales-secondary" aria-label={'Editar categoria ' + category.name} onClick={() => { setEditing(category); setName(category.name); setError(''); document.getElementById('category-name')?.focus() }}>Editar</button><button type="button" className="sales-secondary" aria-label={(category.active ? 'Inativar ' : 'Reativar ') + category.name} onClick={() => save({ ...category, active: !category.active })}>{category.active ? 'Inativar' : 'Reativar'}</button></li>)}</ul>
        {!categories.length && <p className="editor-hint">Nenhuma categoria criada.</p>}
        {error && <p className="editor-error" id="category-error" role="alert">{error}</p>}{notice && <p role="status" className="editor-hint">{notice}</p>}{busy && <p role="status">Salvando categoria simulada…</p>}
        <details className="demo-controls"><summary>Cenários de demonstração</summary><label className="editor-check"><input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />Simular falha ao salvar</label></details>
      </fieldset>
      <footer><button type="button" className="sales-primary" disabled={busy} onClick={onClose}>Concluir</button></footer>
    </form>
  </DemoDialog>
}

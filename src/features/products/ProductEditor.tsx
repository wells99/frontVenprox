import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import { moneyInput, parseMoney } from '../sales/saleDraft'
import { normalize } from '../sales/demoSales'
import type { CatalogProduct } from './productDemo'
import { CategoryPanel } from './CategoryPanel'
import type { Category, SaveCategory } from './CategoryPanel'
import './editor.css'

type Props = { product?: CatalogProduct; products: CatalogProduct[]; categories: Category[]; onCategorySave: SaveCategory; onClose: () => void; onSave: (product: CatalogProduct) => string | undefined }
export function ProductEditor({ product, products, categories, onClose, onSave, onCategorySave }: Props) {
  const [panel, setPanel] = useState(false)
  const categoryFocus = useRef<HTMLElement | null>(null)
  const [version, setVersion] = useState(product?.version)
  const [id] = useState(() => product?.id ?? crypto.randomUUID())
  const [values, setValues] = useState({ name: product?.name ?? '', code: product?.code ?? '', barcode: product?.barcode ?? '', unit: product?.unit ?? 'UN', price: product ? moneyInput(product.priceCents) : '', category: product?.category ?? '', cost: product?.costCents === undefined ? '' : moneyInput(product.costCents), known: product?.costCents !== undefined, active: product?.active ?? true })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [scenario, setScenario] = useState('normal')
  const lock = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  function change(key: string, value: string | boolean) { setValues((old) => ({ ...old, [key]: value })); setErrors({}) }
  function save() {
    if (lock.current) return
    const next: Record<string, string> = {}
    if (!values.name.trim()) next.name = 'Informe o nome.'
    if (!values.code.trim()) next.code = 'Informe o código textual.'
    else if (products.some((item) => item.id !== id && normalize(item.code) === normalize(values.code.trim()))) next.code = 'Este código já está em uso.'
    if (values.barcode.trim() && products.some((item) => item.id !== id && item.barcode === values.barcode.trim())) next.barcode = 'Este código de barras já está em uso.'
    if (parseMoney(values.price) === undefined) next.price = 'Informe um preço válido, como 5,00.'
    if (values.known && parseMoney(values.cost) === undefined) next.cost = 'Informe o custo ou desmarque custo conhecido.'
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById('product-' + Object.keys(next)[0])?.focus(); return }
    lock.current = true; setBusy(true)
    timer.current = window.setTimeout(() => {
      const error = scenario === 'error' ? 'Falha simulada. Dados preservados; tente novamente.' : scenario === 'conflict' ? 'Versão conflitante simulada. Feche e reabra para revisar o cadastro atual.' : onSave({ id, version, name: values.name.trim(), code: values.code.trim(), barcode: values.barcode.trim() || undefined, unit: values.unit, priceCents: parseMoney(values.price)!, costCents: values.known ? parseMoney(values.cost) : undefined, category: values.category || undefined, active: values.active, stock: product?.stock ?? 0 })
      if (error) { setErrors({ form: error }); setBusy(false); lock.current = false }
    }, 500)
  }
  function field(key: 'name' | 'code' | 'barcode' | 'price' | 'cost', label: string) { return <label>{label}<input id={'product-' + key} data-initial-focus={key === 'name' || undefined} value={values[key]} maxLength={key === 'name' ? 120 : 60} inputMode={key === 'price' || key === 'cost' ? 'decimal' : undefined} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? 'error-' + key : undefined} onChange={(event) => change(key, event.target.value)} />{errors[key] && <small id={'error-' + key} className="editor-error">{errors[key]}</small>}</label> }
  return <DemoDialog title={product ? 'Editar produto' : 'Adicionar produto'} eyebrow="Catálogo · demonstração em memória" onClose={onClose} locked={busy} className="catalog-dialog">
    <form noValidate onSubmit={(event) => { event.preventDefault(); save() }}>
      <fieldset className="editor-body" disabled={busy}>
        <p className="editor-hint">Dados do produto. O saldo é movimentado pela área Estoque.</p>
        <div className="editor-grid">{field('name', 'Nome · obrigatório')}{field('code', 'Código textual · obrigatório')}{field('barcode', 'Código de barras · opcional')}<label>Unidade<select value={values.unit} onChange={(event) => change('unit', event.target.value)}>{['UN', 'KG', 'G', 'L', 'ML', 'CX', 'PCT'].map((unit) => <option key={unit}>{unit}</option>)}</select></label>{field('price', 'Preço de venda (R$) · obrigatório')}<label>Categoria<select value={values.category} onChange={(event) => change('category', event.target.value)}><option value="">Sem categoria</option>{Array.from(new Set([...categories.filter((item) => item.active).map((item) => item.name), ...(values.category ? [values.category] : [])])).map((name) => <option key={name}>{name}</option>)}</select></label></div>
        <button type="button" className="sales-text-button" onClick={() => { categoryFocus.current = document.activeElement as HTMLElement; setPanel(true) }}>Gerenciar categorias</button>
        <label className="editor-check"><input type="checkbox" checked={values.known} onChange={(event) => change('known', event.target.checked)} />Custo conhecido</label>
        {values.known ? field('cost', 'Custo unitário (R$)') : <p className="editor-hint">Custo não informado. Zero é um custo conhecido quando preenchido.</p>}
        <label className="editor-check"><input type="checkbox" checked={values.active} onChange={(event) => change('active', event.target.checked)} />Produto ativo</label>
        <p className="editor-hint">Recarregar a página apaga as alterações da demonstração.</p>
        <details className="demo-controls"><summary>Cenários de demonstração</summary><label>Resultado ao salvar<select value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="normal">Sucesso</option><option value="error">Falha</option><option value="conflict">Versão conflitante</option></select></label></details>
      </fieldset>
      {errors.form && <p className="editor-error editor-message" role="alert">{errors.form}</p>}
      {busy && <p className="editor-message" role="status">Salvando produto simulado…</p>}
      <footer><button type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="sales-primary" disabled={busy}>Salvar produto</button></footer>
    </form>
    {panel && <CategoryPanel categories={categories} products={products} onSave={(category) => {
      const old = categories.find((item) => item.id === category.id)
      const error = onCategorySave(category)
      if (!error && old && old.name !== category.name) {
        if (values.category === old.name) change('category', category.name)
        if (product?.category === old.name) setVersion((value) => (value ?? 0) + 1)
      }
      return error
    }} onClose={() => { setPanel(false); requestAnimationFrame(() => categoryFocus.current?.focus()) }} />}
  </DemoDialog>
}

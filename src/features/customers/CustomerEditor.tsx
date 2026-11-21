import { useEffect, useRef, useState } from 'react'
import { DemoDialog } from '../sales/DemoDialog'
import type { Customer } from './customerDemo'
import { validateCustomer } from './customerDemo'
import '../products/editor.css'
type Props = { customer?: Customer; customers: Customer[]; onSave: (customer: Customer) => string | undefined; onClose: () => void }
export function CustomerEditor({ customer, customers, onSave, onClose }: Props) {
  const [id] = useState(() => customer?.id ?? crypto.randomUUID())
  const [name, setName] = useState(customer?.name ?? '')
  const [contact, setContact] = useState(customer?.contact ?? '')
  const [active, setActive] = useState(customer?.active ?? true)
  const [busy, setBusy] = useState(false)
  const [scenario, setScenario] = useState('normal')
  const [error, setError] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const lock = useRef(false)
  useEffect(() => () => clearTimeout(timer.current), [])
  function save() {
    if (lock.current) return
    const command: Customer = { id, name: name.trim(), contact: contact.trim(), active, version: customer?.version ?? 0 }
    const validation = validateCustomer(customers, command)
    if (validation) { setError(validation); if (!name.trim()) document.getElementById('customer-name')?.focus(); return }
    setError(''); setBusy(true); lock.current = true
    timer.current = window.setTimeout(() => {
      const message = scenario === 'error' ? 'Falha simulada. Seus dados foram mantidos; tente novamente.' : scenario === 'conflict' ? 'Versão conflitante simulada. Feche e reabra para revisar o cadastro atual.' : onSave(command)
      if (message) { setError(message); setBusy(false); lock.current = false }
    }, 500)
  }
  return <DemoDialog title={customer ? 'Editar cliente' : 'Adicionar cliente'} eyebrow="Clientes · demonstração em memória" onClose={onClose} locked={busy} className="catalog-dialog">
    <form noValidate onSubmit={(event) => { event.preventDefault(); save() }}>
      <fieldset className="editor-body" disabled={busy}>
        <p className="editor-hint">Nome é o único dado obrigatório. Clientes podem ter nomes iguais; cada cadastro mantém sua própria identidade e histórico.</p>
        <div className="editor-grid"><label>Nome · obrigatório<input id="customer-name" data-initial-focus maxLength={120} value={name} aria-invalid={!!error && !name.trim()} aria-describedby={error ? 'customer-editor-error' : undefined} onChange={(event) => { setName(event.target.value); setError('') }} /></label><label>Contato · opcional<input maxLength={120} value={contact} placeholder="Telefone, e-mail ou outra forma de contato" onChange={(event) => { setContact(event.target.value); setError('') }} /></label></div>
        <label className="editor-check"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Cliente ativo</label>
        <p className="editor-hint">Inativar preserva o cadastro e o histórico de fiado. Clientes inativos não aparecem em novas escolhas da venda.</p>
        {error && <p id="customer-editor-error" className="editor-error" role="alert">{error}</p>}{busy && <p role="status">Salvando cliente simulado…</p>}
        <p className="editor-hint">Dados fictícios apenas em memória. Recarregar apaga as alterações.</p>
        <details className="demo-controls"><summary>Cenários de cadastro</summary><label>Resultado ao salvar<select value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="normal">Sucesso</option><option value="error">Falha</option><option value="conflict">Versão conflitante</option></select></label></details>
      </fieldset>
      <footer><button type="button" className="sales-secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="sales-primary" disabled={busy}>Salvar cliente</button></footer>
    </form>
  </DemoDialog>
}

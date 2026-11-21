import { useEffect, useRef, useState } from 'react'
import { PaymentIcon } from '../../ui/AppIcon'
import { money } from '../sales/demoSales'
import type { Customer } from './customerDemo'
import { creditBalance, creditLabels } from './creditDemo'
import type { CreditEntry } from './creditDemo'
import './customers.css'
export type CreditAction = 'increase' | 'decrease' | 'settle' | 'reversal'
type Props = { active: boolean; customer?: Customer; entries: CreditEntry[]; blocked: boolean; onBack: () => void; onEdit: (customer: Customer) => void; onMovement?: (action: CreditAction, original?: CreditEntry) => void }
export function CreditPage({ active, customer, entries, blocked, onBack, onEdit, onMovement }: Props) {
  const [scenario, setScenario] = useState('normal')
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { if (active && !blocked) title.current?.focus() }, [active, customer?.id, blocked])
  useEffect(() => { if (scenario !== 'loading') return; const timer = setTimeout(() => setScenario('normal'), 600); return () => clearTimeout(timer) }, [scenario])
  const balance = customer ? creditBalance(entries, customer.id) : 0
  const history = scenario === 'empty' ? [] : entries.filter((entry) => entry.customerId === customer?.id)
  return <section className="products-page" hidden={!active} aria-labelledby="credit-title">
    <header className="sales-header"><h1 id="credit-title" tabIndex={-1} ref={title}>Fiado manual</h1><span className="demo-label"><span aria-hidden="true" />Demonstração · dados fictícios</span></header>
    <button className="sales-text-button" onClick={onBack}>Voltar aos clientes</button>
    {!customer ? <div className="products-empty" role="alert"><h2>Cliente não encontrado</h2><p>O cadastro não está disponível nesta demonstração. Volte à lista para escolher outro cliente.</p></div> : <>
      <section className="customer-credit-summary" aria-label="Resumo do fiado"><div><h2>{customer.name}</h2><p>{customer.contact || 'Contato não informado'} · {customer.active ? 'Cliente ativo' : 'Cliente inativo'}</p><button className="sales-secondary" onClick={() => onEdit(customer)}>Editar cliente</button></div><div className="customer-debt"><span>Dívida atual</span><strong>{money(balance)}</strong></div></section>
      <div className="customer-credit-actions">{onMovement ? <><button className="sales-primary" onClick={() => onMovement('increase')}>Aumentar dívida</button><button className="sales-secondary" disabled={balance === 0} onClick={() => onMovement('decrease')}>Diminuir dívida</button><button className="sales-secondary" disabled={balance === 0} onClick={() => onMovement('settle')}>Quitar dívida</button></> : <p className="editor-hint">Lançamentos e quitação serão conectados na próxima etapa.</p>}</div>
      <p className="products-footnote">Fiado é uma anotação manual. Recebimentos não criam novas vendas, faturamento ou movimento de estoque.</p>
      <h2 className="customer-history-heading">Histórico de lançamentos</h2>
      {scenario === 'loading' ? <div className="products-empty" role="status"><h2>Carregando histórico…</h2></div> : scenario === 'error' ? <div className="products-empty" role="alert"><h2>Não foi possível consultar o histórico</h2><p>Falha simulada. Nenhum lançamento foi alterado.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Tentar novamente</button></div> : !history.length ? <div className="products-empty"><h2>Nenhum lançamento encontrado</h2><p>{scenario === 'empty' ? 'Consulta vazia simulada. O saldo acima continua refletindo os lançamentos reais da demonstração.' : 'Este cliente ainda não possui anotações de fiado.'}</p></div> : <div className="products-table-scroll" role="region" aria-label="Histórico de fiado" tabIndex={0}><table className="products-table credit-history"><thead><tr><th>Data / operador</th><th>Tipo / motivo</th><th>Valor</th><th>Dívida após</th><th>Efeito no caixa</th><th>Ações</th></tr></thead><tbody>{history.map((entry) => {
        const reversed = entries.find((item) => item.reversesId === entry.id)
        const original = entries.find((item) => item.id === entry.reversesId)
        return <tr key={entry.id} className={reversed ? 'credit-reversed' : ''}><td>{new Date(entry.at).toLocaleString('pt-BR', {dateStyle:'short', timeStyle:'short'})}<small>{entry.operator}</small><small>Envio pendente · simulado</small></td><td>{creditLabels[entry.kind]}<small>{entry.reason}</small>{reversed && <small>Revertido · {reversed.id.slice(0,8)}</small>}{original && <small>Reverte {creditLabels[original.kind].toLowerCase()} de {money(original.amount)} · {original.id.slice(0,8)}</small>}</td><td>{entry.delta > 0 ? '+' : '−'} {money(entry.amount)}</td><td>{money(entry.after)}<small>Antes: {money(entry.before)}</small></td><td>{entry.method && <span><PaymentIcon method={entry.method} size={13} /> {entry.method}</span>}<small>{entry.sessionNumber === undefined ? 'Sem movimento de caixa' : 'Caixa #' + entry.sessionNumber + (entry.kind === 'reversal' ? ' · saída' : ' · recebimento')}</small></td><td>{onMovement && entry.kind !== 'reversal' && !reversed && <button className="sales-secondary" aria-label={'Reverter lançamento ' + entry.id} onClick={() => onMovement('reversal', entry)}>Reverter</button>}</td></tr>
      })}</tbody></table></div>}
      <p className="products-footnote">Histórico apenas em memória, sem gravação local ou envio real. Recarregar restaura os dados fictícios.</p>
      <details className="demo-controls"><summary>Cenários do histórico</summary><div><button className="sales-secondary" onClick={() => setScenario('loading')}>Simular carregamento</button><button className="sales-secondary" onClick={() => setScenario('error')}>Simular falha</button><button className="sales-secondary" onClick={() => setScenario(scenario === 'empty' ? 'normal' : 'empty')}>{scenario === 'empty' ? 'Restaurar histórico' : 'Simular histórico vazio'}</button></div></details>
    </>}
  </section>
}

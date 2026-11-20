import { useEffect, useRef, useState } from 'react'
import { AppIcon, PaymentIcon } from '../../ui/AppIcon'
import { DemoDialog } from './DemoDialog'
import { dateLabel, money, totalCents } from './demoSales'
import type { Sale } from './demoSales'
import './detail.css'

type Props = {
  sale?: Sale
  onClose: () => void
  onCancel: (id: string, reason: string, authorized: boolean) => void
  onPrint: (id: string) => void
}
type Scenario = 'normal' | 'loading' | 'error' | 'empty'

export function SaleDetail({ sale, onClose, onCancel, onPrint }: Props) {
  const [scenario, setScenario] = useState<Scenario>('normal')
  const [view, setView] = useState<'detail' | 'receipt'>('detail')
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const [authorized, setAuthorized] = useState(true)
  const [failCancel, setFailCancel] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [busy, setBusy] = useState<'cancel' | 'print' | undefined>()
  const [printerAvailable, setPrinterAvailable] = useState(true)
  const [failPrint, setFailPrint] = useState(false)
  const [printResult, setPrintResult] = useState('')
  const [printError, setPrintError] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const receiptRef = useRef<HTMLButtonElement>(null)
  const receiptBackRef = useRef<HTMLButtonElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => { if (cancelling) reasonRef.current?.focus() }, [cancelling])
  useEffect(() => { if (view === 'receipt') receiptBackRef.current?.focus() }, [view])
  useEffect(() => {
    if (scenario !== 'loading') return
    const loadingTimer = window.setTimeout(() => setScenario('normal'), 700)
    return () => window.clearTimeout(loadingTimer)
  }, [scenario])

  function cancel() {
    if (!sale || timer.current !== undefined || sale.status === 'Cancelada') return
    if (!authorized) { setCancelError('Este operador não tem permissão no cenário atual.'); return }
    if (!reason.trim()) { setCancelError('Informe o motivo do cancelamento.'); reasonRef.current?.focus(); return }
    setCancelError(''); setBusy('cancel')
    timer.current = window.setTimeout(() => {
      timer.current = undefined; setBusy(undefined)
      if (failCancel) { setCancelError('Falha simulada ao cancelar. A venda não foi alterada. O motivo foi mantido para tentar novamente.'); return }
      onCancel(sale.id, reason, authorized)
      setCancelling(false); setReason('')
      receiptRef.current?.focus()
    }, 650)
  }
  function print() {
    if (!sale || !printerAvailable || timer.current !== undefined) return
    setBusy('print'); setPrintResult(''); setPrintError(false)
    timer.current = window.setTimeout(() => {
      timer.current = undefined; setBusy(undefined); setPrintError(failPrint)
      if (!failPrint) onPrint(sale.id)
      setPrintResult(failPrint ? 'Falha de impressão simulada. Tente novamente; os dados da venda foram mantidos.' : 'Impressão simulada da venda #' + sale.number + ' concluída. Nenhum papel foi impresso e nenhuma nova venda foi criada.')
    }, 650)
  }
  function backToDetail() {
    setView('detail')
    window.requestAnimationFrame(() => receiptRef.current?.focus())
  }
  function close() {
    if (busy) return
    if (cancelling) { setCancelling(false); setCancelError(''); window.requestAnimationFrame(() => cancelRef.current?.focus()); return }
    if (view === 'receipt') { backToDetail(); return }
    onClose()
  }

  const available = sale && scenario !== 'empty'
  const ready = available && scenario === 'normal'
  const payments = sale?.payments?.filter((payment) => payment.appliedCents > 0) ?? (sale && sale.payment !== 'Misto' ? [{ method: sale.payment, appliedCents: totalCents(sale), tenderedCents: totalCents(sale), changeCents: 0 }] : [])
  const subtotal = sale?.items.reduce((sum, item) => sum + item.quantity * item.priceCents, 0) ?? 0
  const change = payments.reduce((sum, payment) => sum + payment.changeCents, 0)

  return <DemoDialog title={sale ? 'Venda #' + sale.number : 'Detalhe da venda'} eyebrow="Histórico / detalhe · dados fictícios" onClose={close} locked={Boolean(busy)} className="sale-detail-panel">
    <div className="detail-scroll" aria-busy={Boolean(busy) || scenario === 'loading'}>
      {scenario === 'loading' ? <div className="detail-state" role="status"><AppIcon name="sales" size={32} /><h3>Carregando detalhe…</h3><p>Simulação de consulta. Seu histórico permanece no mesmo lugar.</p></div>
      : scenario === 'error' ? <div className="detail-state" role="alert"><h3>Não foi possível carregar o detalhe</h3><p>Falha simulada. Os filtros e a seleção do histórico foram mantidos.</p><button className="sales-secondary" onClick={() => setScenario('loading')}>Tentar novamente</button></div>
      : !available ? <div className="detail-state"><AppIcon name="search" size={32} /><h3>Venda não encontrada</h3><p>Este registro não está disponível na memória da demonstração. Recarregar a página remove as vendas simuladas.</p>{scenario === 'empty' && <button className="sales-secondary" onClick={() => setScenario('normal')}>Restaurar detalhe</button>}</div>
      : <>
        <div className="detail-meta"><span>{dateLabel(sale.date)} às {sale.time}</span><span className={'detail-status' + (sale.status === 'Cancelada' ? ' is-cancelled' : '')}><AppIcon name={sale.status === 'Cancelada' ? 'close' : 'check'} size={15} />{sale.status}</span></div>
        {sale.status === 'Cancelada' && <div className="detail-cancellation" role="status"><strong>Venda cancelada na demonstração</strong><p>{sale.cancellation?.reason || 'Motivo não disponível neste registro fictício.'}</p>{sale.cancellation && <small>{sale.cancellation.operator} · {new Date(sale.cancellation.at).toLocaleString('pt-BR')}</small>}<p>O registro e seus valores originais foram preservados. Não compõe o total de vendas concluídas.</p></div>}
        {view === 'receipt' ? <>
          <button ref={receiptBackRef} className="sales-text-button detail-back" onClick={backToDetail}>Voltar ao detalhe</button>
          <article className="detail-receipt" aria-label="Prévia do comprovante não fiscal">
            <header><strong>Venprox · Loja demonstração</strong><h3>Comprovante de venda não fiscal</h3><p>PRÉVIA · DADOS FICTÍCIOS</p><p>Venda #{sale.number} · {dateLabel(sale.date)} {sale.time}</p>{sale.status === 'Cancelada' && <strong className="receipt-cancelled">VENDA CANCELADA</strong>}</header>
            <p>Cliente: {sale.customer || 'Não informado'}<br />Operador: {sale.operator}<br />Caixa #{sale.cashSession}</p>
            <ul>{sale.items.map((item, index) => <li key={index}><span>{item.name}<small>{item.quantity} × {money(item.priceCents)}</small></span><strong>{money(item.quantity * item.priceCents)}</strong></li>)}</ul>
            <dl className="detail-totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Desconto</dt><dd>− {money(sale.discountCents ?? 0)}</dd></div><div className="detail-total"><dt>Total</dt><dd>{money(totalCents(sale))}</dd></div></dl>
            <ul>{payments.map((payment) => <li key={payment.method}><span>{payment.method}</span><strong>{money(payment.appliedCents)}</strong></li>)}</ul>
            <p>Recebido: {money(payments.reduce((sum, payment) => sum + payment.tenderedCents, 0))}<br />Troco: {money(change)}</p>
            {sale.notes && <p>Observação: {sale.notes}</p>}
            {sale.cancellation && <p>Cancelamento: {sale.cancellation.reason}</p>}
            <p className="receipt-footnote">Prévia de demonstração · sem validade fiscal.</p>
          </article>
        </> : <div className="detail-grid">
          <div className="detail-main">
            <section className="detail-section"><div className="detail-section-title"><h3>Itens da venda</h3><span>{sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}</span></div><p className="detail-hint">Descrições e preços registrados no momento da venda.</p>
              <table className="detail-items"><caption className="visually-hidden">Itens e valores originais da venda</caption><thead><tr><th>Descrição</th><th>Qtd.</th><th>Unitário</th><th>Total</th></tr></thead><tbody>{sale.items.map((item, index) => <tr key={index}><td>{item.name}</td><td>{item.quantity}</td><td>{money(item.priceCents)}</td><td>{money(item.quantity * item.priceCents)}</td></tr>)}</tbody></table>
            </section>
            <section className="detail-section"><h3>Pagamento informado</h3><ul className="detail-payments">{payments.map((payment) => <li key={payment.method}><span><PaymentIcon method={payment.method} size={18} />{payment.method}{payment.changeCents > 0 && <small>Recebido {money(payment.tenderedCents)} · troco {money(payment.changeCents)}</small>}</span><strong>{money(payment.appliedCents)}</strong></li>)}</ul><p className="detail-hint">Registro manual de demonstração, sem confirmação bancária.</p></section>
            <section className="detail-section"><h3>Dados da venda</h3><dl className="detail-facts"><div><dt>Cliente</dt><dd>{sale.customer || 'Não informado'}</dd></div><div><dt>Operador</dt><dd>{sale.operator}</dd></div><div><dt>Sessão de caixa</dt><dd>Caixa #{sale.cashSession}</dd></div><div><dt>Observações</dt><dd>{sale.notes || 'Sem observações'}</dd></div></dl></section>
          </div>
          <aside className="detail-summary" aria-label="Resumo da venda"><h3>Resumo</h3><dl className="detail-totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Desconto</dt><dd>− {money(sale.discountCents ?? 0)}</dd></div><div className="detail-total"><dt>Total</dt><dd>{money(totalCents(sale))}</dd></div></dl>
            <div className="detail-sync"><span className={'sync-badge ' + (sale.sync === 'Pendente' ? 'pending' : 'received')}>{sale.sync === 'Pendente' ? 'Envio pendente' : 'Envio recebido'} · simulado</span><p>Dados apenas em memória. Nenhuma informação foi enviada a um servidor.</p></div>
            <button ref={receiptRef} className="sales-secondary" onClick={() => setView('receipt')}><AppIcon name="printer" size={17} />Ver comprovante</button><p className="detail-hint">Comprovante não fiscal.<br />Impressão automática desligada.</p>
          </aside>
        </div>}
        <div className="detail-print"><button className="sales-secondary" disabled={!printerAvailable || Boolean(busy)} onClick={print}><AppIcon name="printer" size={17} />{busy === 'print' ? 'Simulando impressão…' : sale.printCount ? 'Simular reimpressão' : 'Simular impressão'}</button><span>{!printerAvailable ? 'Impressora indisponível no cenário.' : (sale.printCount ?? 0) > 0 ? sale.printCount + ' impressão(ões) simulada(s) nesta sessão.' : 'Nenhuma impressão simulada nesta sessão.'}</span></div>
        {printResult && <p className={'detail-message' + (printError ? ' has-error' : '')} role={printError ? 'alert' : 'status'}>{printResult}</p>}
        {view === 'detail' && <section className="detail-cancel-section" aria-label="Cancelamento da venda">
          {cancelling ? <form onSubmit={(event) => { event.preventDefault(); cancel() }}><h3>Cancelar venda #{sale.number}?</h3><p>A simulação preserva os itens e pagamentos para consulta e retira a venda dos totais de concluídas. Não movimenta caixa, estoque ou pagamentos reais.</p><label htmlFor="cancellation-reason">Motivo do cancelamento <span>(obrigatório)</span></label><textarea id="cancellation-reason" ref={reasonRef} maxLength={300} rows={3} value={reason} disabled={Boolean(busy)} aria-invalid={Boolean(cancelError)} aria-describedby={cancelError ? 'cancellation-error' : undefined} onChange={(event) => { setReason(event.target.value); setCancelError('') }} />{cancelError && <p id="cancellation-error" className="detail-message has-error" role="alert">{cancelError}</p>}<div className="detail-cancel-actions"><button type="button" className="sales-secondary" disabled={Boolean(busy)} onClick={() => { setCancelling(false); setCancelError(''); window.requestAnimationFrame(() => cancelRef.current?.focus()) }}>Manter venda</button><button type="submit" className="detail-danger" disabled={!authorized || Boolean(busy)}>{busy === 'cancel' ? 'Simulando cancelamento…' : 'Confirmar cancelamento simulado'}</button></div></form>
          : <><div><h3>{sale.status === 'Cancelada' ? 'Cancelamento registrado' : 'Cancelar esta venda'}</h3><p>{sale.status === 'Cancelada' ? 'Esta venda já foi cancelada. Um novo cancelamento está bloqueado.' : authorized ? 'Exige motivo e permissão do operador na simulação.' : 'Operador sem permissão de cancelamento no cenário atual.'}</p></div><button ref={cancelRef} className="detail-danger" disabled={sale.status === 'Cancelada' || !authorized || Boolean(busy)} onClick={() => { setCancelError(''); setCancelling(true) }}>Cancelar venda</button></>}
        </section>}
      </>}
      {sale && <details className="demo-controls detail-scenarios"><summary>Cenários de demonstração</summary><fieldset disabled={Boolean(busy)}><legend className="visually-hidden">Cenários do detalhe</legend><label>Consulta<select value={scenario} onChange={(event) => { setScenario(event.target.value as Scenario); setCancelling(false); setView('detail') }}><option value="normal">Normal</option><option value="loading">Carregando</option><option value="error">Falha de consulta</option><option value="empty">Venda não encontrada</option></select></label><label><input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} />Permitir cancelamento (simulação)</label><label><input type="checkbox" checked={failCancel} onChange={(event) => setFailCancel(event.target.checked)} />Falha de cancelamento</label><label><input type="checkbox" checked={printerAvailable} onChange={(event) => setPrinterAvailable(event.target.checked)} />Impressora disponível (simulação)</label><label><input type="checkbox" checked={failPrint} onChange={(event) => setFailPrint(event.target.checked)} />Falha de impressão</label></fieldset></details>}
    </div>
    <footer className="detail-footer"><span>{busy ? 'Aguarde a simulação…' : ready ? 'Consulta de demonstração · sem persistência' : 'O contexto do histórico foi preservado.'}</span><button data-initial-focus className="sales-primary" disabled={Boolean(busy)} onClick={onClose}>Voltar ao histórico <kbd>Esc</kbd></button></footer>
  </DemoDialog>
}

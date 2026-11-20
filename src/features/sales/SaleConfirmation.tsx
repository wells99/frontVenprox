import { useEffect, useRef, useState } from 'react'
import { AppIcon, PaymentIcon } from '../../ui/AppIcon'
import { DemoDialog } from './DemoDialog'
import { dateLabel, money, totalCents } from './demoSales'
import type { Sale } from './demoSales'
import './confirmation.css'

type Props = {
  sale?: Sale
  onClose: () => void
  onNewSale: () => void
  onSync: (id: string, sync: Sale['sync']) => void
  onPrint: (id: string) => void
}

export function SaleConfirmation({ sale, onClose, onNewSale, onSync, onPrint }: Props) {
  const [printing, setPrinting] = useState(false)
  const [printMessage, setPrintMessage] = useState('')
  const [printError, setPrintError] = useState(false)
  const [printerAvailable, setPrinterAvailable] = useState(true)
  const [failPrint, setFailPrint] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [failSend, setFailSend] = useState(false)
  const printTimer = useRef<number | undefined>(undefined)
  const sendTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => {
    window.clearTimeout(printTimer.current)
    window.clearTimeout(sendTimer.current)
  }, [])

  function print() {
    if (!sale || !printerAvailable || printTimer.current !== undefined) return
    setPrinting(true); setPrintMessage(''); setPrintError(false)
    printTimer.current = window.setTimeout(() => {
      printTimer.current = undefined
      setPrinting(false)
      setPrintError(failPrint)
      if (!failPrint) onPrint(sale.id)
      setPrintMessage(failPrint
        ? 'Falha de impressão simulada. A venda continua concluída. Tente imprimir novamente, sem refazer o pagamento.'
        : 'Impressão simulada da venda #' + sale.number + ' concluída. Nenhum papel foi impresso.')
    }, 650)
  }

  function send() {
    if (!sale || sale.sync === 'Recebida' || sendTimer.current !== undefined) return
    setSending(true); setSendError(false)
    sendTimer.current = window.setTimeout(() => {
      sendTimer.current = undefined
      setSending(false); setSendError(failSend)
      if (!failSend) onSync(sale.id, 'Recebida')
    }, 650)
  }

  if (!sale) return <DemoDialog title="Confirmação indisponível" onClose={onClose} className="confirmation-dialog">
    <div className="sale-dialog-body"><p>Esta venda não está disponível na memória desta demonstração. Recarregar a página apaga os registros simulados.</p><p>Este endereço, sozinho, não comprova que uma venda foi salva. Consulte o histórico disponível.</p></div>
    <footer><button data-initial-focus className="sales-primary" onClick={onClose}>Voltar ao histórico</button></footer>
  </DemoDialog>

  const change = sale.payments?.reduce((sum, payment) => sum + payment.changeCents, 0) ?? 0
  return <DemoDialog title="Venda feita!" onClose={onClose} className="confirmation-dialog">
    <div onKeyDown={(event) => { if (event.key === 'Enter' && event.repeat) event.preventDefault() }}>
      <div className="confirmation-body">
        <div className="confirmation-success" aria-hidden="true"><AppIcon name="check" size={34} /></div>
        <div className="confirmation-amount"><span>Total da venda simulada</span><strong>{money(totalCents(sale))}</strong></div>
        <p className="confirmation-reference">Venda <strong>#{sale.number}</strong> · {dateLabel(sale.date)} às {sale.time}</p>
        <div className="confirmation-payment"><span><PaymentIcon method={sale.payment} size={19} />{sale.payment}</span><span>Troco <strong>{money(change)}</strong></span></div>
        <div className={'confirmation-sync' + (sendError ? ' has-error' : '')} role="status">
          <strong>{sending ? 'Simulando envio…' : sendError ? 'Falha de envio simulada · envio pendente' : sale.sync === 'Recebida' ? 'Envio recebido (simulado)' : 'Envio pendente (simulado)'}</strong>
          <p>{sendError ? 'A venda continua concluída nesta demonstração. Tente o envio novamente, sem repetir o pagamento.' : 'Venda apenas na memória da demonstração. Não foi gravada neste computador nem enviada a um servidor.'}</p>
        </div>
        <div className="confirmation-print">
          <button className="sales-secondary" disabled={!printerAvailable || printing} onClick={print}><AppIcon name="printer" size={17} />{printing ? 'Simulando impressão…' : sale.printCount ? 'Simular reimpressão' : 'Simular impressão'}</button>
          <p>{printerAvailable ? 'Comprovante não fiscal · impressão automática desligada.' : 'Impressora indisponível no cenário. A venda continua concluída.'}</p>
        </div>
        {printMessage && <p className={printError ? 'checkout-error' : 'confirmation-print-result'} role={printError ? 'alert' : 'status'}>{printMessage}</p>}
        <details className="demo-controls confirmation-scenarios">
          <summary>Cenários de demonstração</summary>
          <label className="check-option"><input type="checkbox" checked={printerAvailable} disabled={printing} onChange={(event) => setPrinterAvailable(event.target.checked)} />Impressora disponível (simulação)</label>
          <label className="check-option"><input type="checkbox" checked={failPrint} disabled={printing} onChange={(event) => setFailPrint(event.target.checked)} />Simular falha de impressão</label>
          <label className="check-option"><input type="checkbox" checked={failSend} disabled={sending || sale.sync === 'Recebida'} onChange={(event) => setFailSend(event.target.checked)} />Simular falha de envio</label>
          <button className="sales-secondary" disabled={sending || sale.sync === 'Recebida'} onClick={send}>{sending ? 'Aguarde…' : sale.sync === 'Recebida' ? 'Envio simulado concluído' : 'Simular envio'}</button>
        </details>
      </div>
      <footer className="confirmation-actions"><button data-initial-focus className="sales-primary" onClick={onNewSale}><AppIcon name="add" size={17} />Iniciar Nova Venda</button><button className="sales-text-button" onClick={onClose}>Voltar ao histórico</button></footer>
    </div>
  </DemoDialog>
}

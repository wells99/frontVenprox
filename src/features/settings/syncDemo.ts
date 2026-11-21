import type { Sale } from '../sales/demoSales'

export type SyncScenario = 'offline' | 'sending' | 'conflict' | 'auth' | 'blocked' | 'empty' | 'unreadable'
export const syncScenarios: { id: SyncScenario; label: string; title: string; guidance: string }[] = [
  { id: 'offline', label: 'Sem conexão', title: 'Envios aguardando conexão', guidance: 'Na operação real, registros já salvos localmente aguardariam o serviço. Esta demonstração não possui armazenamento durável.' },
  { id: 'sending', label: 'Envio em andamento', title: 'Enviando registros · simulação', guidance: 'A contagem permanece até uma confirmação. O cenário não envia nem confirma dados.' },
  { id: 'conflict', label: 'Conflito de produto', title: 'Uma alteração precisa de revisão', guidance: 'Confira as duas versões com o responsável. As pendências são preservadas durante a revisão.' },
  { id: 'auth', label: 'Autorização expirada', title: 'É necessário renovar a autorização', guidance: 'Na integração real, entre novamente com o responsável. Nenhuma senha é solicitada nesta demonstração.' },
  { id: 'blocked', label: 'Envio bloqueado', title: 'O envio precisa de suporte', guidance: 'Preserve os dados deste computador e forneça o resumo de diagnóstico ao suporte. Não refaça vendas ou pagamentos.' },
  { id: 'empty', label: 'Sem pendências no exemplo', title: 'Nenhuma pendência no exemplo consultado', guidance: 'Somente uma resposta válida do serviço poderia confirmar envios em dia. Este resultado é fictício.' },
  { id: 'unreadable', label: 'Leitura indisponível', title: 'Não foi possível consultar as pendências', guidance: 'A quantidade e a idade são desconhecidas. Falha de leitura não significa que a fila esteja vazia.' },
]
// Apenas vendas marcadas nesta sessão; não representa a fila completa do terminal.
export function pendingSalesSummary(sales: Sale[], now: number) {
  const pending = sales.filter((sale) => sale.sync === 'Pendente')
  const times = pending.map((sale) => Date.parse(sale.recordedAt ?? `${sale.date}T${sale.time}:00-03:00`))
  const oldest = times.length && times.every(Number.isFinite) ? Math.min(...times) : undefined
  return { count: pending.length, oldest, ageMinutes: oldest !== undefined && oldest <= now ? Math.floor((now - oldest) / 60000) : undefined }
}
export function syncSnapshot(sales: Sale[], scenario: SyncScenario, now: number) {
  const summary = pendingSalesSummary(sales, now)
  return {
    count: scenario === 'unreadable' ? undefined : scenario === 'empty' ? 0 : summary.count,
    ageMinutes: scenario === 'unreadable' || scenario === 'empty' ? undefined : summary.ageMinutes,
    conflicts: scenario === 'unreadable' ? undefined : scenario === 'conflict' ? 1 : 0,
    lastSuccess: scenario === 'unreadable' ? undefined : '20/11/2026 às 13:40 · fictício',
  }
}
export function pendingAgeLabel(minutes: number | undefined) {
  if (minutes === undefined) return 'Não disponível'
  if (minutes < 60) return `${minutes} min`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
  return `${Math.floor(minutes / 1440)} dia(s)`
}

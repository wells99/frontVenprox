export type RecoverySource = 'local' | 'backup' | 'cloud'
export type RecoveryScenario = 'healthy' | 'wrong-store' | 'incompatible' | 'unreadable' | 'unavailable' | 'empty'
export type DataCounts = { sales: number; products: number; customers: number }
export type RecoveryCandidate = {
  source: RecoverySource; storeId: string; storeName: string; compatible: boolean; readable: boolean; available: boolean
  cutoff: string; lastReceived: string; pendingSales?: number; counts?: DataCounts
}
export const demoStoreId = 'LOJA-DEMO-01'
export const recoverySources: {id: RecoverySource; title: string; description: string}[] = [
  {id:'local',title:'Usar dados deste computador',description:'Conferir os registros desta sessão, mantendo a base em uso.'},
  {id:'backup',title:'Restaurar backup',description:'Examinar uma cópia fictícia, com loja e data de corte identificadas.'},
  {id:'cloud',title:'Recuperar da nuvem',description:'Examinar apenas o que um servidor fictício teria recebido.'},
]
export function recoveryCandidate(source: RecoverySource, scenario: RecoveryScenario, counts: DataCounts, pendingSales: number): RecoveryCandidate {
  const healthy: RecoveryCandidate = {
    source, storeId:demoStoreId,storeName:'Loja demonstração',compatible:true,readable:true,available:true,
    cutoff:source === 'local' ? 'Estado atual desta sessão' : source === 'backup' ? '20/11/2026 às 12:00 · fictício' : '20/11/2026 às 11:30 · fictício',
    lastReceived:source === 'local' ? 'Não comprovado nesta base' : '20/11/2026 às 11:30 · fictício',
    pendingSales:source === 'cloud' ? undefined : source === 'local' ? pendingSales : 2,
    counts:source === 'local' ? {...counts} : {sales:18,products:12,customers:5},
  }
  if (scenario === 'wrong-store') return {...healthy,storeId:'OUTRA-LOJA-DEMO',storeName:'Outra loja fictícia'}
  if (scenario === 'incompatible') return {...healthy,compatible:false}
  if (scenario === 'unreadable') return {...healthy,readable:false,pendingSales:undefined,counts:undefined,cutoff:'Desconhecido',lastReceived:'Desconhecida'}
  if (scenario === 'unavailable') return {...healthy,available:false,pendingSales:undefined,counts:undefined,cutoff:'Desconhecido',lastReceived:'Desconhecida'}
  if (scenario === 'empty') return {...healthy,counts:{sales:0,products:0,customers:0},pendingSales:undefined}
  return healthy
}
export function validateRecovery(candidate: RecoveryCandidate): string[] {
  const errors: string[] = []
  if (!candidate.available) errors.push('Origem indisponível. Confira acesso, conexão e autorização com o responsável; nenhuma cópia foi preparada.')
  if (!candidate.readable) errors.push('Não foi possível ler os dados. Pendências desconhecidas; preserve o original e solicite diagnóstico.')
  if (candidate.storeId !== demoStoreId) errors.push('A cópia pertence a outra loja. Não é possível continuar com esta origem.')
  if (!candidate.compatible) errors.push('Versão incompatível. A cópia precisa de análise antes de ser utilizada.')
  if (!candidate.counts || Object.values(candidate.counts).some((count) => !Number.isSafeInteger(count) || count < 0)) errors.push('Contagem de registros não confirmada.')
  else if (Object.values(candidate.counts).every((count) => count === 0)) errors.push('A origem está vazia. Não substitua os dados existentes para tentar corrigir um problema.')
  return errors
}
export type RecoveryRun = { id: string; candidate: RecoveryCandidate; phase: 'validating' | 'review' | 'failed' | 'complete'; errors: string[] }
// A cópia de diagnóstico nunca recebe referências mutáveis da base em uso.
export function startRecovery(id: string, candidate: RecoveryCandidate): RecoveryRun {
  return {id,candidate:{...candidate,counts:candidate.counts ? {...candidate.counts} : undefined},phase:'validating',errors:[]}
}
export function prepareRecovery(run: RecoveryRun, simulateFailure = false): RecoveryRun {
  if (run.phase !== 'validating') return run
  const errors = simulateFailure ? ['Falha simulada ao preparar a cópia. A base em uso foi preservada; tente validar novamente.'] : validateRecovery(run.candidate)
  return {...run,phase:errors.length ? 'failed' : 'review',errors}
}
export function completeRecovery(run: RecoveryRun, acknowledged: boolean, terminalChecked: boolean): RecoveryRun {
  if (run.phase !== 'review' || !acknowledged || !terminalChecked || validateRecovery(run.candidate).length) return run
  return {...run,phase:'complete'}
}

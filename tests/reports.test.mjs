import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType:'custom' })
let reports
try { reports = await server.ssrLoadModule('/src/features/reports/reportDemo.ts') } finally { await server.close() }
const filters = {from:'2026-11-20',to:'2026-11-20',criterion:'sales',group:'hour'}
const sale = { id:'s1',number:1,date:'2026-11-20',time:'10:00',items:[{productId:'p',name:'Produto',quantity:1,priceCents:1000,costCents:400}],payment:'Misto',payments:[{method:'Dinheiro',appliedCents:400,tenderedCents:1000,changeCents:600},{method:'Pix',appliedCents:600,tenderedCents:600,changeCents:0}],customer:'',operator:'Teste',cashSession:27,status:'Concluída',sync:'Pendente'}
test('relatório separa troco, digitais, fiado, abertura e caixa das vendas', () => {
 const session = { movements:[{kind:'credit-receipt',at:'2026-11-20T12:00:00-03:00',amounts:{Dinheiro:300}},{kind:'opening',at:'2026-11-20T09:00:00-03:00',amounts:{Dinheiro:2000}},{kind:'supply',at:'2026-11-20T09:00:00-03:00',amounts:{Dinheiro:500}}] }
 const result = reports.summarizeReport([sale],[session],filters)
 assert.equal(result.net,1000); assert.equal(result.creditNet,300); assert.equal(result.methods.find((item) => item.method === 'Dinheiro').sales,400); assert.equal(result.methods.find((item) => item.method === 'Pix').sales,600); assert.equal(result.partialProfit,600)
 assert.equal(result.coveragePercent,100)
})
test('avulsos entram no faturamento com custo desconhecido; zero conhecido é distinto', () => {
 const mixed = {...sale,items:[{name:'Avulso',quantity:1,priceCents:500},{name:'Custo zero conhecido',quantity:1,priceCents:500,costCents:0}],payments:undefined,payment:'Dinheiro'}
 const result = reports.summarizeReport([mixed],[],filters)
 assert.equal(result.net,1000); assert.equal(result.coveragePercent,50); assert.equal(result.partialProfit,500); assert.equal(result.coveredUnits,1); assert.equal(result.units,2)
})
test('desconto é rateado em centavos e o custo histórico não depende do cadastro atual', () => {
 const value = {...sale,items:[{name:'Conhecido',quantity:1,priceCents:101,costCents:30},{name:'Desconhecido',quantity:1,priceCents:101}],discountCents:1}
 const coverage = reports.saleCostCoverage(value)
 assert.equal(coverage.revenue,201); assert.equal(coverage.knownRevenue,101); assert.equal(coverage.knownCost,30)
 assert.equal(reports.summarizeReport([value],[],filters).partialProfit,71)
 assert.equal(value.items[0].costCents,30)
})
test('data da venda e data de movimentos tratam cancelamento posterior sem dupla contagem', () => {
 const cancelled = {...sale,status:'Cancelada',cancellation:{at:'2026-11-21T10:00:00-03:00',reason:'Teste',operator:'Teste'}}
 const cohort = reports.summarizeReport([cancelled],[],filters)
 assert.equal(cohort.net,0); assert.equal(cohort.count,0); assert.equal(cohort.ticket,undefined); assert.equal(cohort.partialProfit,0)
 const first = reports.summarizeReport([cancelled],[],{...filters,criterion:'movements'})
 const next = reports.summarizeReport([cancelled],[],{...filters,from:'2026-11-21',to:'2026-11-21',criterion:'movements'})
 assert.equal(first.net,1000); assert.equal(next.net,-1000); assert.equal(next.cancellations,1); assert.equal(next.partialProfit,-600); assert.equal(first.net+next.net,0)
 assert.equal(next.methods.find((item) => item.method === 'Pix').sales,-600)
})
test('estorno agrupa pelo horário de Brasília e separa reversão de fiado', () => {
 const cancelled = {...sale,date:'2026-11-19',status:'Cancelada',cancellation:{at:'2026-11-21T01:00:00Z'}}
 const result = reports.summarizeReport([cancelled],[{movements:[{kind:'credit-receipt',at:'2026-11-20T09:00:00-03:00',amounts:{Pix:300}},{kind:'credit-reversal',at:'2026-11-20T10:00:00-03:00',amounts:{Pix:-100}}]}],{...filters,criterion:'movements'})
 assert.equal(result.buckets[0].key,'22h'); assert.equal(result.net,-1000); assert.equal(result.creditNet,200)
})
test('consulta vazia e intervalo inválido não produzem totais ou ticket fictício', () => {
 const empty = reports.summarizeReport([],[],filters)
 assert.equal(empty.net,0); assert.equal(empty.ticket,undefined); assert.equal(empty.coveragePercent,undefined)
 assert.ok(reports.validateReportRange('2026-02-30','2026-03-01'))
 assert.ok(reports.validateReportRange('2026-11-21','2026-11-20'))
 assert.equal(reports.summarizeReport([sale],[],{...filters,from:'2026-11-21'}).events.length,0)
})

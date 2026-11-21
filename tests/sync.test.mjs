import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
const server = await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'})
let sync
try { sync = await server.ssrLoadModule('/src/features/settings/syncDemo.ts') } finally { await server.close() }
const sales = [{id:'p',sync:'Pendente',date:'2026-11-20',time:'12:00'},{id:'r',sync:'Recebida',date:'2026-11-19',time:'10:00'}]
const now = Date.parse('2026-11-20T14:00:00-03:00')
test('sem conexão preserva a contagem e idade, sem converter falha em fila vazia', () => {
 assert.equal(sync.syncSnapshot(sales,'offline',now).count,1)
 assert.equal(sync.syncSnapshot(sales,'offline',now).ageMinutes,120)
 assert.equal(sync.syncSnapshot(sales,'unreadable',now).count,undefined)
 assert.equal(sync.syncSnapshot(sales,'unreadable',now).lastSuccess,undefined)
})
test('exemplo vazio é distinto da leitura indisponível; cenários não modificam vendas', () => {
 const before = structuredClone(sales)
 assert.equal(sync.syncSnapshot(sales,'empty',now).count,0)
 assert.equal(sync.syncSnapshot(sales,'conflict',now).conflicts,1)
 assert.equal(sync.syncSnapshot(sales,'sending',now).count,1)
 assert.deepEqual(sales,before)
})
test('idade desconhecida não vira zero; ignora recebidas e não informa idade negativa', () => {
 assert.equal(sync.pendingSalesSummary([{...sales[0],time:'inválido'}],now).ageMinutes,undefined)
 assert.equal(sync.pendingSalesSummary(sales,now-86400000).ageMinutes,undefined)
 assert.equal(sync.pendingSalesSummary([],now).count,0)
 assert.equal(sync.pendingAgeLabel(undefined),'Não disponível')
 assert.equal(sync.pendingSalesSummary([{...sales[0],recordedAt:'2026-11-20T13:00:00-03:00'}],now).ageMinutes,60)
})

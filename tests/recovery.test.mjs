import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
const server = await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'})
let recovery
try { recovery = await server.ssrLoadModule('/src/features/settings/recoveryDemo.ts') } finally { await server.close() }
const counts = {sales:24,products:12,customers:5}
const candidate = (source='local',scenario='healthy') => recovery.recoveryCandidate(source,scenario,counts,3)
test('origem local é padrão seguro e cópia isolada não modifica dados em uso', () => {
 const local = candidate()
 const run = recovery.startRecovery('a',local)
 run.candidate.counts.sales = 99
 assert.equal(local.counts.sales,24)
 assert.deepEqual(counts,{sales:24,products:12,customers:5})
 assert.equal(recovery.recoverySources[0].id,'local')
})
test('loja divergente, versão incompatível, ilegível, indisponível e vazia bloqueiam conclusão', () => {
 for (const scenario of ['wrong-store','incompatible','unreadable','unavailable','empty']) {
  const run = recovery.prepareRecovery(recovery.startRecovery(scenario,candidate('backup',scenario)))
  assert.equal(run.phase,'failed',scenario)
  assert.ok(run.errors.length)
  assert.equal(recovery.completeRecovery(run,true,true),run)
 }
})
test('ilegibilidade não prova ausência de pendências; nuvem nunca conhece a fila local', () => {
 assert.equal(candidate('local','unreadable').pendingSales,undefined)
 assert.equal(candidate('cloud').pendingSales,undefined)
 assert.equal(candidate('local').pendingSales,3)
 assert.equal(candidate('backup').pendingSales,2)
})
test('conclusão exige validação e ambas as conferências; repetição é inofensiva', () => {
 const initial = recovery.startRecovery('a',candidate('cloud'))
 assert.equal(recovery.completeRecovery(initial,true,true),initial)
 const ready = recovery.prepareRecovery(initial)
 assert.equal(ready.phase,'review')
 for (const [scope,terminal] of [[false,false],[false,true],[true,false]]) assert.equal(recovery.completeRecovery(ready,scope,terminal),ready)
 const done = recovery.completeRecovery(ready,true,true)
 assert.equal(done.phase,'complete')
 assert.equal(recovery.completeRecovery(done,true,true),done)
 assert.equal(recovery.prepareRecovery(done),done)
 assert.equal(ready.phase,'review')
})
test('falha de preparação mantém a cópia e permite nova tentativa sem promover dados', () => {
 const initial = recovery.startRecovery('a',candidate('backup'))
 const failed = recovery.prepareRecovery(initial,true)
 assert.equal(failed.phase,'failed')
 assert.deepEqual(failed.candidate,initial.candidate)
 assert.equal(recovery.prepareRecovery(recovery.startRecovery('b',failed.candidate)).phase,'review')
})
test('contagens inválidas não passam por validação nem por conclusão', () => {
 for (const sales of [-1,NaN,Infinity,1.5]) assert.ok(recovery.validateRecovery({...candidate(),counts:{...counts,sales}}).length)
 const invalid = {...recovery.startRecovery('a',candidate()),phase:'review',candidate:candidate('backup','wrong-store')}
 assert.equal(recovery.completeRecovery(invalid,true,true),invalid)
})

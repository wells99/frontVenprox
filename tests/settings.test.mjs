import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
const server = await createServer({ configFile:false, optimizeDeps:{noDiscovery:true,include:[]}, server:{middlewareMode:true,hmr:false,ws:false}, appType:'custom' })
let settings, draft
try { settings = await server.ssrLoadModule('/src/features/settings/settingsDemo.ts'); draft = await server.ssrLoadModule('/src/features/sales/saleDraft.ts') } finally { await server.close() }
const original = {id:'sale',items:[],printCount:0}
test('padrões preservam estoque permissivo e nenhuma impressão automática', () => {
 assert.equal(settings.defaultPreferences.allowSalesWithoutStock,true)
 assert.equal(settings.defaultPreferences.automaticPrint,false)
 assert.equal(settings.simulateAutomaticPrint(original,settings.defaultPreferences),original)
})
test('salvamento valida permissão, versão e perfil sem alterar as preferências anteriores', () => {
 const current = settings.defaultPreferences
 const command = {values:{allowSalesWithoutStock:false,automaticPrint:true,receiptProfile:'80 mm'},expectedVersion:1,authorized:true}
 const updated = settings.applyPreferences(current,command)
 assert.equal(updated.version,2); assert.equal(updated.allowSalesWithoutStock,false)
 assert.equal(current.allowSalesWithoutStock,true)
 assert.equal(settings.applyPreferences(updated,command),updated)
 for (const invalid of [{...command,authorized:false},{...command,expectedVersion:0},{...command,values:{...command.values,receiptProfile:'invalid'}}]) assert.equal(settings.applyPreferences(current,invalid),current)
})
test('registro de impressão automática é simulado, preserva venda e não repete intenção', () => {
 const prefs = {...settings.defaultPreferences,automaticPrint:true,receiptProfile:'58 mm'}
 const result = settings.simulateAutomaticPrint(original,prefs)
 assert.equal(result.automaticPrintProfile,'58 mm'); assert.equal(result.printCount,1)
 assert.equal(result.items,original.items); assert.equal(original.printCount,0)
 assert.equal(settings.simulateAutomaticPrint(result,prefs),result)
})
test('política estrita confere avulsos, cadastro ativo e saldo; permissiva não bloqueia esses saldos', () => {
 const product = {id:'p',code:'P',name:'Produto',priceCents:500,stock:0,active:true}
 const item = {id:'i',productId:'p',name:'Produto',quantity:1,priceCents:500}
 assert.equal(draft.validateDraft([item],'0,00',false,[product]),undefined)
 assert.ok(draft.validateDraft([item],'0,00',true,[product]))
 assert.ok(draft.validateDraft([{...item,productId:undefined}],'0,00',true,[product]))
 assert.ok(draft.validateDraft([item],'0,00',true,[]))
 assert.ok(draft.validateDraft([item],'0,00',true,[{...product,active:false,stock:10}]))
 assert.equal(draft.validateDraft([item],'0,00',true,[{...product,stock:10}]),undefined)
})

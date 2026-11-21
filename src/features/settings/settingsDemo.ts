import type { Sale } from '../sales/demoSales'
export type ReceiptProfile = 'A4' | '58 mm' | '80 mm'
export type PreferenceValues = { allowSalesWithoutStock: boolean; automaticPrint: boolean; receiptProfile: ReceiptProfile }
export type DemoPreferences = PreferenceValues & { version: number }
export const defaultPreferences: DemoPreferences = { allowSalesWithoutStock: true, automaticPrint: false, receiptProfile: 'A4', version: 1 }
export const preferenceValues = ({ allowSalesWithoutStock, automaticPrint, receiptProfile }: DemoPreferences): PreferenceValues => ({ allowSalesWithoutStock, automaticPrint, receiptProfile })
export type PreferenceCommand = { values: PreferenceValues; expectedVersion: number; authorized: boolean }
export function validatePreferences(current: DemoPreferences, command: PreferenceCommand): string | undefined {
  if (!command.authorized) return 'Permissão simulada negada. As preferências salvas foram mantidas.'
  if (command.expectedVersion !== current.version) return 'As preferências mudaram. Descarte as alterações para carregar a versão atual.'
  if (typeof command.values.allowSalesWithoutStock !== 'boolean' || typeof command.values.automaticPrint !== 'boolean' || !['A4','58 mm','80 mm'].includes(command.values.receiptProfile)) return 'Preferências inválidas. Revise as opções antes de salvar.'
}
export function applyPreferences(current: DemoPreferences, command: PreferenceCommand): DemoPreferences { return validatePreferences(current,command) ? current : { ...command.values, version: current.version + 1 } }
export function simulateAutomaticPrint(sale: Sale, preferences: DemoPreferences): Sale {
  if (!preferences.automaticPrint || sale.automaticPrintProfile) return sale
  return { ...sale, automaticPrintProfile: preferences.receiptProfile, printCount: (sale.printCount ?? 0) + 1 }
}

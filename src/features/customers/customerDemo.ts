export type Customer = { id: string; name: string; contact: string; active: boolean; version: number }
export const demoCustomers: Customer[] = [
  { id: 'ana', name: 'Ana exemplo', contact: '(11) 00000-0001', active: true, version: 1 },
  { id: 'bruno', name: 'Bruno exemplo', contact: '', active: true, version: 1 },
  { id: 'carla', name: 'Carla exemplo', contact: '(11) 00000-0003', active: false, version: 1 },
]
export function validateCustomer(customers: Customer[], customer: Customer): string | undefined {
  if (!customer.name.trim() || customer.name.trim().length > 120) return 'Informe um nome com até 120 caracteres.'
  if (customer.contact.trim().length > 120) return 'Use até 120 caracteres para o contato.'
  const current = customers.find((item) => item.id === customer.id)
  if (current && current.version !== customer.version) return 'Este cliente mudou. Feche e abra novamente para revisar os dados atuais.'
}

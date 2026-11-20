export const navigation = [
  { id: 'vendas', label: 'Vendas', icon: 'sales' },
  { id: 'clientes', label: 'Clientes', icon: 'customers' },
  { id: 'produtos', label: 'Produtos', icon: 'products' },
  { id: 'estoque', label: 'Estoque', icon: 'stock' },
  { id: 'contas-a-pagar', label: 'Contas a Pagar', icon: 'bills' },
  { id: 'caixa', label: 'Caixa', icon: 'cash' },
  { id: 'relatorios', label: 'Relatórios', icon: 'reports' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
] as const
export type SectionId = (typeof navigation)[number]['id']
export type NavigationIconName = (typeof navigation)[number]['icon'] | 'menu'

import type { CategorySlice, Transaction, TransactionType } from '../types'

export interface Summary {
  income: number
  expense: number
  net: number
  /** net / gelir; gelir 0 ise null */
  savingsRate: number | null
}

export function inMonth(transactions: Transaction[], monthKey: string) {
  return transactions.filter((t) => t.date.startsWith(monthKey))
}

export function summarize(transactions: Transaction[]): Summary {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  const net = income - expense
  return { income, expense, net, savingsRate: income > 0 ? net / income : null }
}

/** Seçili türün kategorilere göre dağılımı, büyükten küçüğe. */
export function byCategory(transactions: Transaction[], type: TransactionType): CategorySlice[] {
  const totals = new Map<Transaction['category'], number>()
  for (const t of transactions) {
    if (t.type !== type) continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0)
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total, percent: sum > 0 ? total / sum : 0 }))
    .sort((a, b) => b.total - a.total)
}

export function sortNewestFirst(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))
}

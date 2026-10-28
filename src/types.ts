export type TransactionType = 'income' | 'expense'

export type IncomeCategory = 'Maaş' | 'Freelance' | 'Yatırım' | 'Diğer Gelir'
export type ExpenseCategory =
  | 'Kira'
  | 'Market'
  | 'Fatura'
  | 'Ulaşım'
  | 'Eğlence'
  | 'Sağlık'
  | 'Eğitim'
  | 'Alışveriş'
  | 'Diğer Gider'
export type Category = IncomeCategory | ExpenseCategory

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  /** Her zaman pozitif; işareti type belirler. */
  amount: number
  category: Category
  /** ISO: "2026-10-28" */
  date: string
  note?: string
}

export interface CategorySlice {
  category: Category
  total: number
  percent: number
}

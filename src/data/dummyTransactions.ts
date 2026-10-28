import type { Category, Transaction, TransactionType } from '../types'

type Seed = [TransactionType, string, Category, number, number]

// [tür, başlık, kategori, tutar, ayın günü]
const SEEDS: Seed[] = [
  ['income', 'Aylık maaş', 'Maaş', 62000, 1],
  ['income', 'Web sitesi projesi', 'Freelance', 14500, 9],
  ['income', 'Temettü', 'Yatırım', 2300, 14],
  ['expense', 'Ev kirası', 'Kira', 18000, 2],
  ['expense', 'Haftalık market', 'Market', 3450, 4],
  ['expense', 'Market (ikinci)', 'Market', 2180, 11],
  ['expense', 'Elektrik faturası', 'Fatura', 1240, 6],
  ['expense', 'İnternet', 'Fatura', 450, 7],
  ['expense', 'Akbil yükleme', 'Ulaşım', 900, 3],
  ['expense', 'Akaryakıt', 'Ulaşım', 2600, 12],
  ['expense', 'Sinema ve yemek', 'Eğlence', 1350, 8],
  ['expense', 'Spor salonu', 'Sağlık', 1100, 5],
  ['expense', 'Online kurs', 'Eğitim', 799, 10],
  ['expense', 'Kışlık mont', 'Alışveriş', 4200, 13],
]

/** İçinde bulunulan aya yayılmış örnek işlemler. Gelecekteki günler bugüne çekilir. */
export function createDummyTransactions(now = new Date()): Transaction[] {
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()

  return SEEDS.map(([type, title, category, amount, day]) => {
    const d = Math.min(day, daysInMonth, today)
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { id: crypto.randomUUID(), type, title, category, amount, date }
  })
}

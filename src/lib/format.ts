const currency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })
const percent = new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 0 })

export const formatMoney = (value: number) => currency.format(value)

/** İşaretli tutar: "+₺1.000,00" / "−₺1.000,00". Renge ek olarak işaret de taşır. */
export function formatSigned(value: number, sign: '+' | '−') {
  return `${sign}${currency.format(Math.abs(value))}`
}

export const formatPercent = (ratio: number) => percent.format(ratio)

/** "2026-10-28" -> "28 Eki". Yerel saat dilimi kaymasını önlemek için elle ayrıştırılır. */
export function formatDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

/** "2026-10" -> "Ekim 2026" */
export function formatMonth(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
}

export function monthKeyOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(monthKey: string, delta: number) {
  const [y, m] = monthKey.split('-').map(Number)
  return monthKeyOf(new Date(y, m - 1 + delta, 1))
}

export function todayIso() {
  const n = new Date()
  return `${monthKeyOf(n)}-${String(n.getDate()).padStart(2, '0')}`
}

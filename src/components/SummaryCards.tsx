import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { Summary } from '../lib/aggregate'
import { formatMoney, formatPercent } from '../lib/format'

export function SummaryCards({ summary }: { summary: Summary }) {
  const negative = summary.net < 0

  return (
    <section aria-labelledby="balance-label" className="ledger-lines rounded-lg border border-rule bg-card px-5 py-5 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <h2 id="balance-label" className="text-sm font-medium text-muted">
            Net bakiye
          </h2>
          <p
            className={`font-serif text-5xl font-semibold leading-[72px] sm:text-7xl ${
              negative ? 'text-expense' : 'text-ink'
            }`}
          >
            {negative ? '−' : ''}
            {formatMoney(Math.abs(summary.net))}
          </p>
          <p className="text-sm text-muted">
            {negative ? 'Bu ay giderler geliri aşıyor.' : 'Bu ay gelirin giderlerden fazla.'}
            {summary.savingsRate !== null && (
              <>
                {' '}
                Tasarruf oranı <strong className="text-ink">{formatPercent(summary.savingsRate)}</strong>.
              </>
            )}
          </p>
          {summary.income > 0 && (
            <div
              role="img"
              aria-label={`Gelirin ${formatPercent(summary.expense / summary.income)} kadarı harcandı`}
              className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-income/25"
            >
              <div
                className="h-full rounded-full bg-expense transition-[width] duration-500"
                style={{ width: `${Math.min(summary.expense / summary.income, 1) * 100}%` }}
              />
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="flex items-center gap-1 text-sm text-muted">
              <ArrowUpRight size={16} className="text-income" aria-hidden />
              Toplam gelir
            </dt>
            <dd className="font-serif text-2xl font-semibold text-income">{formatMoney(summary.income)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-sm text-muted">
              <ArrowDownRight size={16} className="text-expense" aria-hidden />
              Toplam gider
            </dt>
            <dd className="font-serif text-2xl font-semibold text-expense">{formatMoney(summary.expense)}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ChevronDown, Search, Trash2, X } from 'lucide-react'
import { CATEGORIES_BY_TYPE, CATEGORY_META, TYPE_LABEL } from '../data/categories'
import type { Category, Transaction, TransactionType } from '../types'
import { formatDay, formatMoney, formatSigned } from '../lib/format'
import { SegmentedControl } from './ui/SegmentedControl'

export interface Filters {
  type: TransactionType | 'all'
  category: Category | 'all'
  query: string
}

interface Props {
  transactions: Transaction[]
  totalInMonth: number
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onDelete: (transaction: Transaction) => void
  newestId: string | null
  onAdd: () => void
}

const fieldClass = 'rounded-md border border-rule bg-paper px-3 py-2 text-sm focus:border-brass'

const fullDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
}

export function TransactionList({
  transactions,
  totalInMonth,
  filters,
  onFiltersChange,
  onDelete,
  newestId,
  onAdd,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const categoryOptions =
    filters.type === 'all'
      ? [...CATEGORIES_BY_TYPE.expense, ...CATEGORIES_BY_TYPE.income]
      : CATEGORIES_BY_TYPE[filters.type]
  const filtered = filters.type !== 'all' || filters.category !== 'all' || filters.query !== ''

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="list-title" className="rounded-lg border border-rule bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="list-title" className="font-serif text-xl font-semibold">
            İşlemler
            <span className="ml-2 text-sm font-normal text-muted">
              {transactions.length}
              {filtered ? ` / ${totalInMonth}` : ''}
            </span>
          </h2>
          <SegmentedControl
            label="Türe göre filtrele"
            value={filters.type}
            onValueChange={(type) => onFiltersChange({ type, category: 'all', query: filters.query })}
            options={[
              { value: 'all', label: 'Tümü' },
              { value: 'expense', label: TYPE_LABEL.expense },
              { value: 'income', label: TYPE_LABEL.income },
            ]}
            className="w-64"
          />
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Başlıkta ara</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Başlıkta ara"
              value={filters.query}
              onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
              className={`${fieldClass} w-full pl-9`}
            />
          </label>
          <label>
            <span className="sr-only">Kategoriye göre filtrele</span>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as Filters['category'] })}
              className={`${fieldClass} w-full`}
            >
              <option value="all">Tüm kategoriler</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered && (
          <button
            type="button"
            onClick={() => onFiltersChange({ type: 'all', category: 'all', query: '' })}
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-income underline underline-offset-2"
          >
            <X size={14} aria-hidden /> Filtreleri temizle
          </button>
        )}

        {transactions.length === 0 ? (
          <div className="py-10 text-center text-muted">
            {totalInMonth === 0 ? (
              <>
                <p>Bu ay henüz işlem yok. İlk işlemini ekle.</p>
                <button
                  type="button"
                  onClick={onAdd}
                  className="mt-3 rounded-md bg-income px-4 py-2 text-sm font-semibold text-white"
                >
                  İşlem ekle
                </button>
              </>
            ) : (
              <p>Bu filtreyle eşleşen işlem yok. Filtreleri temizle.</p>
            )}
          </div>
        ) : (
          <ul className="max-h-[34rem] divide-y divide-rule overflow-y-auto pr-1" aria-live="polite">
            {transactions.map((t) => {
              const meta = CATEGORY_META[t.category]
              const Icon = meta.icon
              const open = openId === t.id
              const panelId = `tx-detail-${t.id}`
              return (
                <li key={t.id} className={t.id === newestId ? 'row-enter' : ''}>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenId(open ? null : t.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded py-3 text-left hover:bg-paper"
                    >
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-full text-white"
                        style={{ background: meta.color }}
                        aria-hidden
                      >
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{t.title}</span>
                        <span className="block truncate text-sm text-muted">
                          {t.category} · {formatDay(t.date)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}
                      >
                        <span className="sr-only">{TYPE_LABEL[t.type]}: </span>
                        {formatSigned(t.amount, t.type === 'income' ? '+' : '−')}
                      </span>
                      <ChevronDown
                        size={16}
                        aria-hidden
                        className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(t)}
                      aria-label={`${t.title} işlemini sil (${formatMoney(t.amount)})`}
                      className="rounded p-2 text-muted hover:bg-paper-deep hover:text-expense"
                    >
                      <Trash2 size={18} aria-hidden />
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        {/* Makbuz: kesikli çizgiyle ayrılmış ayrıntılar */}
                        <dl className="mb-3 ml-[3.25rem] space-y-1.5 border-t border-dashed border-rule pt-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-muted">Tarih</dt>
                            <dd className="text-right capitalize">{fullDate(t.date)}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-muted">Tür</dt>
                            <dd>{TYPE_LABEL[t.type]}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-muted">Kategori</dt>
                            <dd>{t.category}</dd>
                          </div>
                          <div className="flex justify-between gap-4 border-t border-dashed border-rule pt-1.5">
                            <dt className="text-muted">Not</dt>
                            <dd className="text-right">{t.note ?? '—'}</dd>
                          </div>
                        </dl>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </MotionConfig>
  )
}

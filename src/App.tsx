import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { CategoryPieChart } from './components/CategoryPieChart'
import { Modal } from './components/Modal'
import { SummaryCards } from './components/SummaryCards'
import { Toast, type ToastData } from './components/Toast'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList, type Filters } from './components/TransactionList'
import { createDummyTransactions } from './data/dummyTransactions'
import { byCategory, inMonth, sortNewestFirst, summarize } from './lib/aggregate'
import { formatMonth, monthKeyOf, shiftMonth } from './lib/format'
import type { Transaction, TransactionType } from './types'

const NO_FILTERS: Filters = { type: 'all', category: 'all', query: '' }

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => createDummyTransactions())
  const [month, setMonth] = useState(() => monthKeyOf(new Date()))
  const [chartType, setChartType] = useState<TransactionType>('expense')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [newestId, setNewestId] = useState<string | null>(null)

  const monthTx = useMemo(() => inMonth(transactions, month), [transactions, month])
  const summary = useMemo(() => summarize(monthTx), [monthTx])
  const slices = useMemo(() => byCategory(monthTx, chartType), [monthTx, chartType])

  const visible = useMemo(() => {
    const q = filters.query.trim().toLocaleLowerCase('tr-TR')
    return sortNewestFirst(monthTx).filter(
      (t) =>
        (filters.type === 'all' || t.type === filters.type) &&
        (filters.category === 'all' || t.category === filters.category) &&
        (q === '' || t.title.toLocaleLowerCase('tr-TR').includes(q)),
    )
  }, [monthTx, filters])

  const showToast = useCallback((data: Omit<ToastData, 'id'>) => setToast({ ...data, id: Date.now() }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  function addTransaction(data: Omit<Transaction, 'id'>) {
    const tx: Transaction = { ...data, id: crypto.randomUUID() }
    setTransactions((prev) => [tx, ...prev])
    setNewestId(tx.id)
    setMonth(tx.date.slice(0, 7)) // eklenen işlem görünür olsun
    setFilters(NO_FILTERS)
    setChartType(tx.type)
    setModalOpen(false)
    showToast({ message: 'Kaydedildi.' })
  }

  function deleteTransaction(tx: Transaction) {
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id))
    showToast({
      message: `"${tx.title}" silindi.`,
      actionLabel: 'Geri al',
      onAction: () => setTransactions((prev) => [tx, ...prev]),
    })
  }

  function toggleCategory(category: Transaction['category']) {
    setFilters((f) =>
      f.category === category && f.type === chartType
        ? NO_FILTERS
        : { ...f, type: chartType, category },
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-6 sm:px-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Defterim</h1>
          <p className="text-sm text-muted">Kişisel gelir ve gider takibi</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-rule bg-card">
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              aria-label="Önceki ay"
              className="p-2 text-muted hover:text-ink"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <span className="min-w-32 text-center text-sm font-medium capitalize" aria-live="polite">
              {formatMonth(month)}
            </span>
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              aria-label="Sonraki ay"
              className="p-2 text-muted hover:text-ink"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-income px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus size={16} aria-hidden /> İşlem ekle
          </button>
        </div>
      </header>

      <main className="space-y-5">
        <SummaryCards summary={summary} />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <CategoryPieChart
            type={chartType}
            onTypeChange={(t) => {
              setChartType(t)
              setFilters(NO_FILTERS)
            }}
            slices={slices}
            activeCategory={filters.category === 'all' ? null : filters.category}
            onCategoryClick={toggleCategory}
            onAdd={() => setModalOpen(true)}
          />
          <TransactionList
            transactions={visible}
            totalInMonth={monthTx.length}
            filters={filters}
            onFiltersChange={setFilters}
            onDelete={deleteTransaction}
            newestId={newestId}
            onAdd={() => setModalOpen(true)}
          />
        </div>
      </main>

      <Modal open={modalOpen} title="İşlem ekle" onClose={() => setModalOpen(false)}>
        <TransactionForm
          defaultType={chartType}
          onSubmit={addTransaction}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}

import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Plus } from 'lucide-react'
import { CATEGORY_META, TYPE_LABEL } from '../data/categories'
import type { CategorySlice, TransactionType } from '../types'
import { formatMoney, formatPercent } from '../lib/format'
import { SegmentedControl } from './ui/SegmentedControl'

interface Props {
  type: TransactionType
  onTypeChange: (type: TransactionType) => void
  slices: CategorySlice[]
  activeCategory: string | null
  onCategoryClick: (category: CategorySlice['category']) => void
  onAdd: () => void
}

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function CategoryPieChart({ type, onTypeChange, slices, activeCategory, onCategoryClick, onAdd }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = slices.reduce((s, x) => s + x.total, 0)
  const label = TYPE_LABEL[type]

  return (
    <section aria-labelledby="chart-title" className="rounded-lg border border-rule bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="chart-title" className="font-serif text-xl font-semibold">
          Kategorilere göre dağılım
        </h2>
        <SegmentedControl
          label="Tür seç"
          value={type}
          onValueChange={onTypeChange}
          options={[
            { value: 'expense', label: TYPE_LABEL.expense },
            { value: 'income', label: TYPE_LABEL.income },
          ]}
          className="w-44"
        />
      </div>

      {slices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-muted">
            Bu ay henüz {label.toLowerCase()} yok. İlk işlemini ekle.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-md bg-income px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} aria-hidden /> İşlem ekle
          </button>
        </div>
      ) : (
        <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative mx-auto aspect-square w-full max-w-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="total"
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="98%"
                  paddingAngle={0}
                  stroke="var(--color-card)"
                  strokeWidth={3}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={!reducedMotion}
                  animationDuration={500}
                  onMouseEnter={(_, i) => setHovered(slices[i].category)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {slices.map((s) => (
                    <Cell
                      key={s.category}
                      fill={CATEGORY_META[s.category].color}
                      fillOpacity={hovered && hovered !== s.category ? 0.4 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    const s = active ? (payload?.[0]?.payload as CategorySlice | undefined) : undefined
                    if (!s) return null
                    return (
                      <div className="rounded-md border border-rule bg-card px-3 py-2 text-sm shadow-md">
                        <p className="font-semibold">{s.category}</p>
                        <p>
                          {formatMoney(s.total)} · {formatPercent(s.percent)}
                        </p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-muted">Toplam {label.toLowerCase()}</span>
              <span className="font-serif text-xl font-semibold sm:text-2xl">{formatMoney(total)}</span>
            </div>
          </div>

          <ul className="space-y-1">
            {slices.map((s) => {
              const active = activeCategory === s.category
              return (
                <li key={s.category}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onCategoryClick(s.category)}
                    onMouseEnter={() => setHovered(s.category)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(s.category)}
                    onBlur={() => setHovered(null)}
                    className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left text-sm ${
                      active ? 'bg-paper-deep' : 'hover:bg-paper'
                    }`}
                  >
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-sm"
                      style={{ background: CATEGORY_META[s.category].color }}
                    />
                    <span className="flex-1 font-medium">{s.category}</span>
                    <span className="text-muted">{formatPercent(s.percent)}</span>
                    <span className="w-24 text-right">{formatMoney(s.total)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

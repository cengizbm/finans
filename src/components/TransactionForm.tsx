import { useState, type FormEvent } from 'react'
import { CATEGORIES_BY_TYPE, TYPE_LABEL } from '../data/categories'
import type { Category, Transaction, TransactionType } from '../types'
import { todayIso } from '../lib/format'

interface Props {
  defaultType: TransactionType
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
  onCancel: () => void
}

interface Errors {
  title?: string
  amount?: string
  date?: string
}

const fieldClass =
  'w-full rounded-md border border-rule bg-paper px-3 py-2 focus:border-brass aria-[invalid=true]:border-expense'

/** "1.250,50" ve "1250.5" gibi girişleri sayıya çevirir. */
function parseAmount(raw: string) {
  const s = raw.trim().replace(/\s/g, '')
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  return Number(normalized)
}

export function TransactionForm({ defaultType, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<TransactionType>(defaultType)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES_BY_TYPE[defaultType][0])
  const [date, setDate] = useState(todayIso())
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  function changeType(next: TransactionType) {
    setType(next)
    setCategory(CATEGORIES_BY_TYPE[next][0])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = parseAmount(amount)
    const next: Errors = {}
    if (!title.trim()) next.title = 'Başlık boş olamaz. Bir başlık yaz.'
    if (!amount.trim() || !Number.isFinite(value) || value <= 0) next.amount = "Tutar 0'dan büyük olmalı."
    if (!date) next.date = 'Tarih seç.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      // İlk hatalı alana odaklan.
      const first = next.title ? 'tx-title' : next.amount ? 'tx-amount' : 'tx-date'
      document.getElementById(first)?.focus()
      return
    }
    onSubmit({
      type,
      title: title.trim(),
      amount: Math.round(value * 100) / 100,
      category,
      date,
      note: note.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Tür</legend>
        <div className="grid grid-cols-2 gap-2">
          {(['expense', 'income'] as const).map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brass ${
                type === t ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper'
              }`}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => changeType(t)}
                className="sr-only"
              />
              {TYPE_LABEL[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="tx-title" className="mb-1 block text-sm font-medium">
          Başlık
        </label>
        <input
          id="tx-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'tx-title-err' : undefined}
          autoFocus
          className={fieldClass}
        />
        {errors.title && (
          <p id="tx-title-err" className="mt-1 text-sm text-expense">
            {errors.title}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tx-amount" className="mb-1 block text-sm font-medium">
            Tutar (₺)
          </label>
          <input
            id="tx-amount"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'tx-amount-err' : undefined}
            className={fieldClass}
          />
          {errors.amount && (
            <p id="tx-amount-err" className="mt-1 text-sm text-expense">
              {errors.amount}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="tx-date" className="mb-1 block text-sm font-medium">
            Tarih
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'tx-date-err' : undefined}
            className={fieldClass}
          />
          {errors.date && (
            <p id="tx-date-err" className="mt-1 text-sm text-expense">
              {errors.date}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="tx-category" className="mb-1 block text-sm font-medium">
          Kategori
        </label>
        <select
          id="tx-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className={fieldClass}
        >
          {CATEGORIES_BY_TYPE[type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tx-note" className="mb-1 block text-sm font-medium">
          Not <span className="font-normal text-muted">(isteğe bağlı)</span>
        </label>
        <textarea id="tx-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={fieldClass} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-medium text-muted hover:text-ink">
          Vazgeç
        </button>
        <button type="submit" className="rounded-md bg-income px-5 py-2 text-sm font-semibold text-white">
          Kaydet
        </button>
      </div>
    </form>
  )
}

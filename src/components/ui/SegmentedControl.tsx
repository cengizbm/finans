// Kaynak: 21st.dev "Segmented Control" (ddoemonn). Defter paletine ve TypeScript ayarlarına uyarlandı.
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const

const SEG =
  'px-3 py-2 text-center text-sm font-medium leading-5 whitespace-nowrap'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  disabled?: boolean
}

interface Props<T extends string> {
  options: SegmentedOption<T>[]
  label: string
  value: T
  onValueChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  label,
  value,
  onValueChange,
  className = '',
}: Props<T>) {
  const count = Math.max(1, options.length)
  const template = `repeat(${count}, minmax(0, 1fr))`
  const [hovered, setHovered] = useState(-1)

  const found = options.findIndex((o) => o.value === value)
  const index = found < 0 ? 0 : found

  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const reduced = useReducedMotion()
  const pos = useMotionValue(index)
  const thumbX = useTransform(pos, (v) => `${v * 100}%`)
  const maskX = useTransform(pos, (v) => `${v * -100}%`)

  useEffect(() => {
    if (reduced) {
      pos.set(index)
      return
    }
    const controls = animate(pos, index, CELL)
    return () => controls.stop()
  }, [index, reduced, pos])

  const seek = useCallback(
    (from: number, dir: number) => {
      let i = from
      for (let k = 0; k < count; k++) {
        i = (i + dir + count) % count
        if (!options[i]?.disabled) return i
      }
      return from
    },
    [count, options],
  )

  const go = useCallback(
    (i: number) => {
      const option = options[i]
      if (!option || option.disabled) return
      buttons.current[i]?.focus()
      if (option.value !== value) onValueChange(option.value)
    },
    [options, value, onValueChange],
  )

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const moves: Record<string, () => number> = {
      ArrowRight: () => seek(i, 1),
      ArrowDown: () => seek(i, 1),
      ArrowLeft: () => seek(i, -1),
      ArrowUp: () => seek(i, -1),
      Home: () => seek(count - 1, 1),
      End: () => seek(0, -1),
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    go(move())
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative inline-block select-none rounded-lg border border-rule bg-paper-deep/60 p-[3px] shadow-[inset_0_1px_2px_rgba(30,42,36,0.08)] ${className}`}
    >
      <div className="relative grid" style={{ gridTemplateColumns: template, touchAction: 'manipulation' }}>
        {options.map((option, i) => (
          <span
            key={option.value}
            aria-hidden
            className={`${SEG} pointer-events-none ${
              hovered === i && i !== index ? 'text-ink' : 'text-muted'
            }`}
          >
            {option.label}
          </span>
        ))}

        {/* Kayan ibre: üstündeki metin katmanı maske ile ters yönde kayarak renk değiştirir. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden rounded-md bg-ink shadow-[0_1px_2px_rgba(30,42,36,0.35)]"
          style={{ width: `${100 / count}%`, x: thumbX }}
          initial={false}
        >
          <motion.div className="absolute inset-0" style={{ x: maskX }} initial={false}>
            <div
              className="absolute inset-y-0 left-0 grid"
              style={{ width: `${count * 100}%`, gridTemplateColumns: template }}
            >
              {options.map((option) => (
                <span key={option.value} className={`${SEG} text-paper`}>
                  {option.label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: template }}
          onPointerLeave={() => setHovered(-1)}
        >
          {options.map((option, i) => (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[i] = node
              }}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-disabled={option.disabled || undefined}
              tabIndex={i === index ? 0 : -1}
              onClick={() => !option.disabled && onValueChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPointerEnter={() => !option.disabled && setHovered(i)}
              className="cursor-pointer rounded-md outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-brass)]"
            >
              <span className="sr-only">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

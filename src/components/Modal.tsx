import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Yerel <dialog>: odak tuzağı, Esc ile kapanma ve odağı geri verme tarayıcıdan gelir. */
export function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="pop-in m-auto w-[min(32rem,calc(100vw-1.5rem))] rounded-lg border border-rule bg-card p-0 text-ink shadow-xl"
    >
      {open && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="font-serif text-2xl font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="-m-2 rounded p-2 text-muted hover:text-ink"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

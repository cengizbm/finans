import { useEffect } from 'react'

export interface ToastData {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface Props {
  toast: ToastData | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3"
    >
      {toast && (
        <div
          key={toast.id}
          className="pop-in pointer-events-auto flex items-center gap-4 rounded-lg bg-ink px-4 py-3 text-sm text-paper shadow-lg"
        >
          <span>{toast.message}</span>
          {toast.actionLabel && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.()
                onDismiss()
              }}
              className="font-semibold text-[#e8c766] underline underline-offset-2"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

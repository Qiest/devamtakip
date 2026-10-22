import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const el = box.current
    const items = () => Array.from(el?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    // Başlıktaki kapat düğmesi yerine içerikteki ilk alana odaklan
    ;(items()[1] ?? items()[0] ?? el)?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeRef.current()
      if (e.key !== 'Tab') return
      const f = items()
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
        className="pb-safe flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-3xl bg-white sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full text-ink/60 hover:bg-mist"><CloseIcon /></button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog(p: { title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title={p.title} onClose={p.onClose}>
      <p className="text-ink/75">{p.message}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={p.onClose} className="h-12 rounded-xl bg-mist font-semibold">Vazgeç</button>
        <button type="button" onClick={() => { p.onConfirm(); p.onClose() }}
          className={`h-12 rounded-xl font-semibold text-white ${p.danger ? 'bg-bad' : 'bg-brand'}`}>{p.confirmLabel}</button>
      </div>
    </Modal>
  )
}

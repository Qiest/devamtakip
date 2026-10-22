import { useState, type FormEvent } from 'react'
import type { Course } from '../types'
import { COURSE_COLORS, DEFAULT_COLOR } from '../lib/colors'
import { MAX_LIMIT, MAX_NAME } from '../lib/storage'
import { Modal } from './Modal'

interface Props {
  initial?: Course
  existingNames: string[]
  onSubmit: (name: string, limit: number | null, color: string) => void
  onClose: () => void
}

export function CourseForm({ initial, existingNames, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [limit, setLimit] = useState(initial?.limit ? String(initial.limit) : '')
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR)
  const [error, setError] = useState<{ name?: string; limit?: string }>({})

  function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const errs: typeof error = {}
    if (!n) errs.name = 'Ders adını yaz.'
    else if (existingNames.some((x) => x.toLocaleLowerCase('tr') === n.toLocaleLowerCase('tr')))
      errs.name = 'Bu isimde bir ders zaten var.'
    const l = limit.trim()
    if (l && (!/^\d+$/.test(l) || +l < 1 || +l > MAX_LIMIT)) errs.limit = `1 ile ${MAX_LIMIT} arasında tam sayı yaz ya da boş bırak.`
    setError(errs)
    if (errs.name || errs.limit) return
    onSubmit(n, l ? +l : null, color)
    onClose()
  }

  const field = 'mt-1.5 h-12 w-full rounded-xl border border-ink/15 bg-white px-3 text-base'
  return (
    <Modal title={initial ? 'Dersi düzenle' : 'Ders ekle'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <label className="block text-sm font-semibold">Ders adı
          <input className={field} value={name} maxLength={MAX_NAME} onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Matematik 1" aria-invalid={!!error.name} autoComplete="off" />
          {error.name && <span role="alert" className="mt-1 block text-sm font-normal text-bad">{error.name}</span>}
        </label>
        <label className="block text-sm font-semibold">Devamsızlık limiti (isteğe bağlı)
          <input className={field} value={limit} inputMode="numeric" onChange={(e) => setLimit(e.target.value)}
            placeholder="Örn. 6" aria-invalid={!!error.limit} />
          {error.limit && <span role="alert" className="mt-1 block text-sm font-normal text-bad">{error.limit}</span>}
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">Renk</legend>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {COURSE_COLORS.map((c) => (
              <button key={c.value} type="button" onClick={() => setColor(c.value)} aria-label={c.name} aria-pressed={color === c.value}
                className={`h-10 w-10 rounded-full border-4 ${color === c.value ? 'border-ink' : 'border-white ring-1 ring-ink/15'}`}
                style={{ background: c.value }} />
            ))}
          </div>
        </fieldset>
        <button type="submit" className="h-12 w-full rounded-xl bg-brand font-semibold text-white active:bg-brand-dark">Kaydet</button>
      </form>
    </Modal>
  )
}

import { useState, type FormEvent } from 'react'
import type { Course, Slot } from '../types'
import { COURSE_COLORS, DEFAULT_COLOR } from '../lib/colors'
import { DAYS } from '../lib/date'
import { MAX_LIMIT, MAX_NAME } from '../lib/storage'
import { Modal } from './Modal'
import { PlusIcon, TrashIcon } from './icons'

interface Props {
  initial?: Course
  existingNames: string[]
  onSubmit: (name: string, limit: number | null, color: string, slots: Slot[]) => void
  onClose: () => void
}

export function CourseForm({ initial, existingNames, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [limit, setLimit] = useState(initial?.limit ? String(initial.limit) : '')
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR)
  const [slots, setSlots] = useState<Slot[]>(initial?.slots ?? [])
  const [error, setError] = useState<{ name?: string; limit?: string; slots?: string }>({})

  const patchSlot = (i: number, p: Partial<Slot>) => setSlots((l) => l.map((s, k) => (k === i ? { ...s, ...p } : s)))
  const addSlot = () => setSlots((l) => [...l, { day: DAYS.find((d) => !l.some((s) => s.day === d.id))?.id ?? 1, start: '', end: '' }])

  function submit(e: FormEvent) {
    e.preventDefault()
    const n = name.trim()
    const errs: typeof error = {}
    if (!n) errs.name = 'Ders adını yaz.'
    else if (existingNames.some((x) => x.toLocaleLowerCase('tr') === n.toLocaleLowerCase('tr')))
      errs.name = 'Bu isimde bir ders zaten var.'
    const l = limit.trim()
    if (l && (!/^\d+$/.test(l) || +l < 1 || +l > MAX_LIMIT)) errs.limit = `1 ile ${MAX_LIMIT} arasında tam sayı yaz ya da boş bırak.`
    if (slots.some((s) => s.start && s.end && s.end <= s.start)) errs.slots = 'Bitiş saati başlangıçtan sonra olmalı.'
    setError(errs)
    if (errs.name || errs.limit || errs.slots) return
    const clean = slots
      .map((s) => ({ day: s.day, start: s.start, end: s.start ? s.end : '' }))
      .filter((s, i, a) => a.findIndex((x) => x.day === s.day && x.start === s.start) === i)
    onSubmit(n, l ? +l : null, color, clean)
    onClose()
  }

  const field = 'mt-1.5 h-12 w-full rounded-xl border border-ink/15 bg-white px-3 text-base'
  const small = 'h-11 rounded-xl border border-ink/15 bg-white px-3 text-base'
  return (
    <Modal title={initial ? 'Dersi düzenle' : 'Ders ekle'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <label className="block text-sm font-semibold">Ders adı
          <input className={field} value={name} maxLength={MAX_NAME} onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Matematik 1" aria-invalid={!!error.name} autoComplete="off" />
          {error.name && <span role="alert" className="mt-1 block text-sm font-normal text-bad">{error.name}</span>}
        </label>

        <fieldset>
          <legend className="text-sm font-semibold">Ders programı</legend>
          <div className="mt-2 space-y-2">
            {slots.map((s, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-ink/10 bg-mist/60 p-2">
                <div className="flex gap-2">
                  <select aria-label="Gün" value={s.day} onChange={(e) => patchSlot(i, { day: +e.target.value })} className={`${small} min-w-0 flex-1`}>
                    {DAYS.map((d) => <option key={d.id} value={d.id}>{d.long}</option>)}
                  </select>
                  <button type="button" aria-label="Bu saati sil" onClick={() => setSlots((l) => l.filter((_, k) => k !== i))}
                    className="grid h-11 w-11 place-items-center rounded-xl text-bad hover:bg-white"><TrashIcon /></button>
                </div>
                <div className="flex items-center gap-2">
                  <input type="time" aria-label="Başlangıç saati" value={s.start} onChange={(e) => patchSlot(i, { start: e.target.value })} className={`${small} min-w-0 flex-1`} />
                  <span aria-hidden="true">–</span>
                  <input type="time" aria-label="Bitiş saati" value={s.end} onChange={(e) => patchSlot(i, { end: e.target.value })} className={`${small} min-w-0 flex-1`} />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSlot} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-mist font-semibold"><PlusIcon /> Gün ve saat ekle</button>
          {error.slots && <p role="alert" className="mt-1 text-sm text-bad">{error.slots}</p>}
          <p className="mt-1.5 text-sm text-ink/55">Hiç gün eklemezsen ders her gün görünür. Saat boş bırakılabilir.</p>
        </fieldset>

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

import { useState } from 'react'
import type { AppData, Course } from '../types'
import type { Actions } from '../hooks/useData'
import { formatTR, isValidISO, todayISO, weekdayTR } from '../lib/date'
import { courseStats, toneClass } from '../lib/stats'
import { Ring } from '../components/Ring'
import { Modal } from '../components/Modal'
import { ChevronIcon, TrashIcon } from '../components/icons'

export type Notify = (text: string, undo?: () => void) => void
interface Props { data: AppData; actions: Actions; notify: Notify; goCourses: () => void }

export function TrackView({ data, actions, notify, goCourses }: Props) {
  const [date, setDate] = useState(todayISO)
  const [detailId, setDetailId] = useState<string | null>(null)
  const valid = isValidISO(date)
  const detail = data.courses.find((c) => c.id === detailId)

  function add(c: Course) {
    if (actions.addAbsence(c.id, date) === 'added')
      notify(`${c.name}: ${formatTR(date)} kaydedildi`, () => actions.removeAbsence(c.id, date))
  }

  if (!data.courses.length)
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 p-8 text-center">
        <p className="text-lg font-bold">Henüz ders yok</p>
        <p className="mt-1 text-ink/65">Devamsızlık kaydetmek için önce bir ders ekle.</p>
        <button onClick={goCourses} className="mt-5 h-12 rounded-xl bg-brand px-6 font-semibold text-white">Ders ekle</button>
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 rounded-2xl bg-ink p-4 text-white">
        <label className="min-w-0 flex-1 text-sm font-semibold">Hangi gün?
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 h-12 w-full rounded-xl bg-white px-3 text-base font-medium text-ink" />
        </label>
        <button type="button" onClick={() => setDate(todayISO())} className="h-12 rounded-xl bg-white/15 px-4 font-semibold">Bugün</button>
      </div>
      <p className="px-1 text-sm text-ink/65" aria-live="polite">
        {valid ? `${formatTR(date)}, ${weekdayTR(date)} için kayıt eklenecek.` : 'Geçerli bir tarih seç.'}
      </p>

      <ul className="space-y-3">
        {data.courses.map((c) => {
          const s = courseStats(c)
          const done = c.absences.includes(date)
          return (
            <li key={c.id} className="rounded-2xl border border-ink/10 bg-white p-4" style={{ borderLeft: `6px solid ${c.color}` }}>
              <div className="flex items-center gap-4">
                <Ring course={c} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{c.name}</h3>
                  <p className={`text-sm font-medium ${toneClass[s.tone]}`}>
                    {c.limit ? `${s.count} / ${c.limit} devamsızlık, ${s.text}` : `${s.count} devamsızlık`}
                  </p>
                </div>
                <button onClick={() => setDetailId(c.id)} aria-label={`${c.name} detayları`} className="grid h-10 w-10 place-items-center rounded-full text-ink/50 hover:bg-mist"><ChevronIcon /></button>
              </div>
              <button type="button" disabled={!valid || done} onClick={() => add(c)}
                className="mt-3 h-12 w-full rounded-xl bg-brand font-semibold text-white active:bg-brand-dark disabled:bg-mist disabled:text-ink/50">
                {done ? 'Bu tarihte kayıtlı' : 'Devamsızlık ekle'}
              </button>
            </li>
          )
        })}
      </ul>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetailId(null)}>
          <p className="mb-3 text-ink/70">
            {detail.absences.length} devamsızlık{detail.limit ? `, ${courseStats(detail).text}` : ''}
          </p>
          {detail.absences.length === 0 ? (
            <p className="rounded-xl bg-mist p-4 text-center text-ink/65">Bu derste kayıtlı devamsızlık yok.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {[...detail.absences].reverse().map((d) => (
                <li key={d} className="flex items-center justify-between py-2.5">
                  <span><span className="font-semibold tabular-nums">{formatTR(d)}</span> <span className="text-ink/60">{weekdayTR(d)}</span></span>
                  <button aria-label={`${formatTR(d)} kaydını sil`} className="grid h-10 w-10 place-items-center rounded-full text-bad hover:bg-mist"
                    onClick={() => { actions.removeAbsence(detail.id, d); notify(`${formatTR(d)} kaydı silindi`, () => actions.addAbsence(detail.id, d)) }}>
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  )
}

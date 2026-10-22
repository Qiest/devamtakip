import { useEffect, useState } from 'react'
import type { AppData, Course } from '../types'
import type { Actions } from '../hooks/useData'
import { addDays, dowOf, formatTR, isValidISO, slotsOn, timeLabel, todayISO, weekdayTR } from '../lib/date'
import { MAX_NOTE } from '../lib/storage'
import { courseStats, toneClass } from '../lib/stats'
import { Ring } from '../components/Ring'

export type Notify = (text: string, undo?: () => void) => void
interface Props { data: AppData; actions: Actions; notify: Notify; goCourses: () => void }

export function TrackView({ data, actions, notify, goCourses }: Props) {
  const [date, setDate] = useState(todayISO)
  const valid = isValidISO(date)
  const today = todayISO()

  if (!data.courses.length)
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 p-8 text-center">
        <p className="text-lg font-bold">Henüz ders yok</p>
        <p className="mt-1 text-ink/65">Önce derslerini ve günlerini ekle.</p>
        <button onClick={goCourses} className="mt-5 h-12 rounded-xl bg-brand px-6 font-semibold text-white">Ders ekle</button>
      </div>
    )

  const dow = valid ? dowOf(date) : -1
  const firstStart = (c: Course) => slotsOn(c.slots, dow)[0]?.start || '99:99'
  const list = valid
    ? data.courses
        .filter((c) => !c.slots.length || c.slots.some((s) => s.day === dow) || c.absences.includes(date))
        .sort((a, b) => firstStart(a).localeCompare(firstStart(b)))
    : []
  const step = 'grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 text-2xl font-bold disabled:opacity-40'

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-ink p-4 text-white">
        <p className="text-2xl font-extrabold" aria-live="polite">{valid ? weekdayTR(date) : 'Tarih seç'}</p>
        <p className="text-white/70">{valid ? `${formatTR(date)}${date === today ? ', bugün' : ''}` : 'Geçerli bir tarih gerekli'}</p>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" className={step} disabled={!valid} onClick={() => setDate(addDays(date, -1))} aria-label="Önceki gün">‹</button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Tarih"
            className="h-12 min-w-0 flex-1 rounded-xl bg-white px-3 text-base font-medium text-ink" />
          <button type="button" className={step} disabled={!valid} onClick={() => setDate(addDays(date, 1))} aria-label="Sonraki gün">›</button>
        </div>
        {date !== today && (
          <button type="button" onClick={() => setDate(today)} className="mt-3 h-10 w-full rounded-xl bg-white/15 font-semibold">Bugüne dön</button>
        )}
      </div>

      {valid && list.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-ink/65">Bu gün için programda ders yok.</p>
      )}

      <ul className="space-y-3">
        {list.map((c) => (
          <CourseRow key={c.id} course={c} date={date} actions={actions} notify={notify} />
        ))}
      </ul>
    </div>
  )
}

function CourseRow({ course: c, date, actions, notify }: { course: Course; date: string; actions: Actions; notify: Notify }) {
  const s = courseStats(c)
  const done = c.absences.includes(date)
  const saved = c.notes[date] ?? ''
  const [note, setNote] = useState(saved)
  useEffect(() => setNote(saved), [saved, date])
  const todays = slotsOn(c.slots, dowOf(date))
  const times = todays.map(timeLabel).filter(Boolean).join(', ')
  const offSchedule = c.slots.length > 0 && todays.length === 0

  function add() {
    if (actions.addAbsence(c.id, date) === 'added')
      notify(`${c.name}: ${formatTR(date)} kaydedildi`, () => actions.removeAbsence(c.id, date))
  }
  function remove() {
    actions.removeAbsence(c.id, date)
    notify(`${c.name}: kayıt kaldırıldı`, () => actions.addAbsence(c.id, date, saved))
  }

  return (
    <li className="rounded-2xl border border-ink/10 bg-white p-4" style={{ borderLeft: `6px solid ${c.color}` }}>
      <div className="flex items-center gap-4">
        <Ring course={c} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">{c.name}</h3>
          <p className={`text-sm font-medium ${toneClass[s.tone]}`}>
            {c.limit ? `${s.count} / ${c.limit} devamsızlık, ${s.text}` : `${s.count} devamsızlık`}
          </p>
          {times && <p className="text-sm font-semibold text-ink/70">{times}</p>}
          {offSchedule && <p className="text-sm text-ink/55">Bu gün programda yok</p>}
        </div>
      </div>

      {!done ? (
        <button type="button" onClick={add} className="mt-3 h-12 w-full rounded-xl bg-brand font-semibold text-white active:bg-brand-dark">
          Devamsızlık ekle
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="rounded-xl bg-bad/10 px-3 py-2 text-sm font-semibold text-bad">Bu gün devamsızlık var</p>
          <input value={note} maxLength={MAX_NOTE} onChange={(e) => setNote(e.target.value)}
            onBlur={() => note.trim() !== saved && actions.setNote(c.id, date, note)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Not ekle (örn. hastaydım)" aria-label={`${c.name} notu`}
            className="h-12 w-full rounded-xl border border-ink/15 bg-white px-3 text-base" />
          <button type="button" onClick={remove} className="h-11 w-full rounded-xl bg-mist font-semibold">Kaydı kaldır</button>
        </div>
      )}
    </li>
  )
}

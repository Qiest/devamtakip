import { useState, type FormEvent } from 'react'
import type { AppData } from '../types'
import type { Actions } from '../hooks/useData'
import { formatTR, weekdayTR } from '../lib/date'
import { MAX_NOTE } from '../lib/storage'
import { Modal } from '../components/Modal'
import { TrashIcon } from '../components/icons'
import type { Notify } from './TrackView'

interface Props { data: AppData; actions: Actions; notify: Notify }

export function HistoryView({ data, actions, notify }: Props) {
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState<{ id: string; date: string } | null>(null)

  const items = data.courses
    .filter((c) => filter === 'all' || c.id === filter)
    .flatMap((c) => c.absences.map((date) => ({ c, date })))
    .sort((a, b) => b.date.localeCompare(a.date) || a.c.name.localeCompare(b.c.name, 'tr'))

  const editCourse = editing ? data.courses.find((c) => c.id === editing.id) : undefined

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold">Ders
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-ink/15 bg-white px-3 text-base">
          <option value="all">Tüm dersler</option>
          {data.courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <p className="px-1 text-sm text-ink/65">{items.length} devamsızlık kaydı</p>

      {items.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-ink/65">Henüz devamsızlık kaydı yok.</p>}

      <ul className="space-y-3">
        {items.map(({ c, date }) => {
          const note = c.notes[date]
          return (
            <li key={`${c.id}-${date}`} className="rounded-2xl border border-ink/10 bg-white p-4" style={{ borderLeft: `6px solid ${c.color}` }}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold tabular-nums">{formatTR(date)} <span className="font-medium text-ink/60">{weekdayTR(date)}</span></p>
                  <p className="truncate text-sm text-ink/70">{c.name}</p>
                  <p className={`mt-1 text-sm ${note ? '' : 'text-ink/45'}`}>{note || 'Not yok'}</p>
                </div>
                <button onClick={() => setEditing({ id: c.id, date })} className="h-10 rounded-xl bg-mist px-3 text-sm font-semibold">{note ? 'Notu düzenle' : 'Not ekle'}</button>
                <button aria-label={`${c.name} ${formatTR(date)} kaydını sil`} className="grid h-10 w-10 place-items-center rounded-full text-bad hover:bg-mist"
                  onClick={() => { actions.removeAbsence(c.id, date); notify(`${formatTR(date)} kaydı silindi`, () => actions.addAbsence(c.id, date, note ?? '')) }}>
                  <TrashIcon />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {editing && editCourse && (
        <NoteModal title={`${editCourse.name}, ${formatTR(editing.date)}`} initial={editCourse.notes[editing.date] ?? ''}
          onSave={(n) => actions.setNote(editing.id, editing.date, n)} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function NoteModal({ title, initial, onSave, onClose }: { title: string; initial: string; onSave: (n: string) => void; onClose: () => void }) {
  const [note, setNote] = useState(initial)
  function submit(e: FormEvent) { e.preventDefault(); onSave(note); onClose() }
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">Not
          <input value={note} maxLength={MAX_NOTE} onChange={(e) => setNote(e.target.value)} placeholder="Örn. hastaydım"
            className="mt-1.5 h-12 w-full rounded-xl border border-ink/15 bg-white px-3 text-base" />
        </label>
        <button type="submit" className="h-12 w-full rounded-xl bg-brand font-semibold text-white">Kaydet</button>
      </form>
    </Modal>
  )
}

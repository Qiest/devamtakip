import { useState } from 'react'
import type { AppData, Course } from '../types'
import type { Actions } from '../hooks/useData'
import { daysSummary } from '../lib/date'
import { CourseForm } from '../components/CourseForm'
import { ConfirmDialog } from '../components/Modal'
import { EditIcon, PlusIcon, TrashIcon } from '../components/icons'

export function CoursesView({ data, actions }: { data: AppData; actions: Actions }) {
  const [form, setForm] = useState<{ course?: Course } | null>(null)
  const [removing, setRemoving] = useState<Course | null>(null)
  const names = (skip?: string) => data.courses.filter((c) => c.id !== skip).map((c) => c.name)

  return (
    <div className="space-y-4">
      <button onClick={() => setForm({})} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-white active:bg-brand-dark">
        <PlusIcon /> Ders ekle
      </button>

      {data.courses.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-ink/65">Henüz ders eklemedin.</p>}

      <ul className="space-y-3">
        {data.courses.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4" style={{ borderLeft: `6px solid ${c.color}` }}>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold">{c.name}</h3>
              <p className="text-sm text-ink/60">{daysSummary(c.days)}</p>
              <p className="text-sm text-ink/60">{c.limit ? `Limit: ${c.limit}` : 'Limit yok'}, {c.absences.length} devamsızlık</p>
            </div>
            <button onClick={() => setForm({ course: c })} aria-label={`${c.name} dersini düzenle`} className="grid h-11 w-11 place-items-center rounded-full hover:bg-mist"><EditIcon /></button>
            <button onClick={() => setRemoving(c)} aria-label={`${c.name} dersini sil`} className="grid h-11 w-11 place-items-center rounded-full text-bad hover:bg-mist"><TrashIcon /></button>
          </li>
        ))}
      </ul>

      {form && (
        <CourseForm initial={form.course} existingNames={names(form.course?.id)} onClose={() => setForm(null)}
          onSubmit={(n, l, col, d) => form.course ? actions.updateCourse(form.course.id, { name: n, limit: l, color: col, days: d }) : actions.addCourse(n, l, col, d)} />
      )}
      {removing && (
        <ConfirmDialog danger title="Dersi sil" confirmLabel="Sil" onClose={() => setRemoving(null)} onConfirm={() => actions.deleteCourse(removing.id)}
          message={`"${removing.name}" dersi ve ${removing.absences.length} devamsızlık kaydı kalıcı olarak silinecek.`} />
      )}
    </div>
  )
}

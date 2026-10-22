import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { AppData, Course, Slot } from '../types'
import { MAX_NOTE, emptyData, newId, sanitize } from '../lib/storage'
import { isValidISO } from '../lib/date'
import { db } from '../lib/firebase'

export type AddResult = 'added' | 'duplicate' | 'invalid' | 'missing'

export function useData(docId: string) {
  const [data, setData] = useState<AppData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)
  const ref = useRef(data)
  const docRef = useMemo(() => doc(db!, 'devamtakip', docId), [docId])

  const apply = useCallback((next: AppData) => {
    ref.current = next
    setData(next)
  }, [])

  const commit = useCallback((next: AppData) => {
    apply(next)
    setDoc(docRef, next).then(() => setSaveError(false)).catch(() => setSaveError(true))
  }, [apply, docRef])

  useEffect(() => {
    let first = true
    return onSnapshot(
      docRef,
      (snap) => {
        const isFirst = first
        first = false
        if (snap.exists()) {
          // Kendi yazdığımız değişikliklerin yankısını yok say (zaten uygulandı)
          if (isFirst || !snap.metadata.hasPendingWrites) apply(sanitize(snap.data()) ?? emptyData())
        }
        setLoading(false)
      },
      () => { setSaveError(true); setLoading(false) },
    )
  }, [docRef, apply])

  const actions = useMemo(() => {
    const mapCourse = (id: string, fn: (c: Course) => Course) =>
      commit({ ...ref.current, courses: ref.current.courses.map((c) => (c.id === id ? fn(c) : c)) })

    return {
      addCourse(name: string, limit: number | null, color: string, slots: Slot[]) {
        const course: Course = { id: newId(), name, limit, color, slots, absences: [], notes: {} }
        commit({ ...ref.current, courses: [...ref.current.courses, course] })
      },
      updateCourse(id: string, patch: Pick<Course, 'name' | 'limit' | 'color' | 'slots'>) {
        mapCourse(id, (c) => ({ ...c, ...patch }))
      },
      deleteCourse(id: string) {
        commit({ ...ref.current, courses: ref.current.courses.filter((c) => c.id !== id) })
      },
      addAbsence(id: string, iso: string, note = ''): AddResult {
        if (!isValidISO(iso)) return 'invalid'
        const course = ref.current.courses.find((c) => c.id === id)
        if (!course) return 'missing'
        if (course.absences.includes(iso)) return 'duplicate'
        const n = note.trim().slice(0, MAX_NOTE)
        mapCourse(id, (c) => ({ ...c, absences: [...c.absences, iso].sort(), notes: n ? { ...c.notes, [iso]: n } : c.notes }))
        return 'added'
      },
      removeAbsence(id: string, iso: string) {
        mapCourse(id, (c) => {
          const notes = { ...c.notes }
          delete notes[iso]
          return { ...c, absences: c.absences.filter((d) => d !== iso), notes }
        })
      },
      setNote(id: string, iso: string, note: string) {
        const course = ref.current.courses.find((c) => c.id === id)
        if (!course || !course.absences.includes(iso)) return
        const n = note.trim().slice(0, MAX_NOTE)
        mapCourse(id, (c) => {
          const notes = { ...c.notes }
          if (n) notes[iso] = n
          else delete notes[iso]
          return { ...c, notes }
        })
      },
    }
  }, [commit])

  return { data, loading, saveError, actions }
}

export type Actions = ReturnType<typeof useData>['actions']

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import type { AppData, Course } from '../types'
import { STORAGE_KEY, emptyData, loadData, newId, sanitize } from '../lib/storage'
import { isValidISO } from '../lib/date'
import { DATA_DOC_ID, db } from '../lib/firebase'

export type AddResult = 'added' | 'duplicate' | 'invalid' | 'missing'

export function useData() {
  const [data, setData] = useState<AppData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(false)
  const ref = useRef(data)
  const docRef = useMemo(() => doc(db!, 'devamtakip', DATA_DOC_ID), [])

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
          if (isFirst || !snap.metadata.hasPendingWrites) apply(sanitize(snap.data()) ?? emptyData())
        } else if (!snap.metadata.fromCache) {
          const local = loadData()
          if (local.courses.length) {
            apply(local)
            setDoc(docRef, local).then(() => localStorage.removeItem(STORAGE_KEY)).catch(() => setSaveError(true))
          } else apply(emptyData())
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
      addCourse(name: string, limit: number | null, color: string) {
        const course: Course = { id: newId(), name, limit, color, absences: [] }
        commit({ ...ref.current, courses: [...ref.current.courses, course] })
      },
      updateCourse(id: string, patch: Pick<Course, 'name' | 'limit' | 'color'>) {
        mapCourse(id, (c) => ({ ...c, ...patch }))
      },
      deleteCourse(id: string) {
        commit({ ...ref.current, courses: ref.current.courses.filter((c) => c.id !== id) })
      },
      addAbsence(id: string, iso: string): AddResult {
        if (!isValidISO(iso)) return 'invalid'
        const course = ref.current.courses.find((c) => c.id === id)
        if (!course) return 'missing'
        if (course.absences.includes(iso)) return 'duplicate'
        mapCourse(id, (c) => ({ ...c, absences: [...c.absences, iso].sort() }))
        return 'added'
      },
      removeAbsence(id: string, iso: string) {
        mapCourse(id, (c) => ({ ...c, absences: c.absences.filter((d) => d !== iso) }))
      },
    }
  }, [commit])

  return { data, loading, saveError, actions }
}

export type Actions = ReturnType<typeof useData>['actions']
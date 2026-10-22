import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { onValue, ref as dbRef, set } from 'firebase/database'
import type { AppData, Course } from '../types'
import { MAX_NOTE, STORAGE_KEY, emptyData, loadData, newId, sanitize } from '../lib/storage'
import { isValidISO } from '../lib/date'
import { DATA_DOC_ID, db } from '../lib/firebase'

export type AddResult = 'added' | 'duplicate' | 'invalid' | 'missing'

// İnternet yokken uygulama açılırsa son bilinen veriyi göstermek için yerel kopya
const CACHE_KEY = 'devamtakip:cache'
function loadCache(): AppData | null {
  try {
    const t = localStorage.getItem(CACHE_KEY)
    return t ? sanitize(JSON.parse(t)) : null
  } catch { return null }
}
function saveCache(d: AppData) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)) } catch { /* dolu olabilir */ }
}

export function useData() {
  const [cached] = useState(loadCache)
  const [data, setData] = useState<AppData>(cached ?? emptyData)
  const [loading, setLoading] = useState(!cached)
  const [saveError, setSaveError] = useState(false)
  const ref = useRef(data)
  const node = useMemo(() => dbRef(db!, `devamtakip/${DATA_DOC_ID}`), [])

  const apply = useCallback((next: AppData) => {
    ref.current = next
    setData(next)
    saveCache(next)
  }, [])

  const commit = useCallback((next: AppData) => {
    apply(next)
    set(node, next).then(() => setSaveError(false)).catch(() => setSaveError(true))
  }, [apply, node])

  useEffect(() => {
    return onValue(
      node,
      (snap) => {
        if (snap.exists()) apply(sanitize(snap.val()) ?? emptyData())
        else {
          // Bulutta kayıt yok: eski yerel veri varsa bir kereye mahsus taşı
          const local = loadData()
          if (local.courses.length) {
            apply(local)
            set(node, local).then(() => localStorage.removeItem(STORAGE_KEY)).catch(() => setSaveError(true))
          } else apply(emptyData())
        }
        setLoading(false)
      },
      () => { setSaveError(true); setLoading(false) },
    )
  }, [node, apply])

  const actions = useMemo(() => {
    const mapCourse = (id: string, fn: (c: Course) => Course) =>
      commit({ ...ref.current, courses: ref.current.courses.map((c) => (c.id === id ? fn(c) : c)) })

    return {
      addCourse(name: string, limit: number | null, color: string, days: number[]) {
        const course: Course = { id: newId(), name, limit, color, days, absences: [], notes: {} }
        commit({ ...ref.current, courses: [...ref.current.courses, course] })
      },
      updateCourse(id: string, patch: Pick<Course, 'name' | 'limit' | 'color' | 'days'>) {
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

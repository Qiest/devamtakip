import type { AppData, Course, Slot } from '../types'
import { COURSE_COLORS, DEFAULT_COLOR } from './colors'
import { isTime, isValidISO } from './date'

export const STORAGE_KEY = 'devamtakip:v1'
export const MAX_NAME = 60
export const MAX_LIMIT = 365
export const MAX_NOTE = 200

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const emptyData = (): AppData => ({ version: 1, courses: [] })

/** Bilinmeyen bir nesneyi güvenli AppData'ya çevirir; geçersizse null. */
export function sanitize(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null
  const list = (raw as { courses?: unknown }).courses
  if (!Array.isArray(list)) return null

  const seen = new Set<string>()
  const courses: Course[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const c = item as Record<string, unknown>
    const name = typeof c.name === 'string' ? c.name.trim().slice(0, MAX_NAME) : ''
    if (!name) continue
    let id = typeof c.id === 'string' && c.id ? c.id : newId()
    if (seen.has(id)) id = newId()
    seen.add(id)
    const limit =
      typeof c.limit === 'number' && Number.isInteger(c.limit) && c.limit >= 1 && c.limit <= MAX_LIMIT
        ? c.limit
        : null
    const color = COURSE_COLORS.some((x) => x.value === c.color) ? (c.color as string) : DEFAULT_COLOR
    const absences = Array.isArray(c.absences)
      ? [...new Set(c.absences.filter(isValidISO))].sort()
      : []
    // Eski sürümde ders günleri `days` listesiydi; saatsiz slota çevrilir
    const rawSlots: unknown[] = Array.isArray(c.slots)
      ? c.slots
      : Array.isArray(c.days)
        ? c.days.map((day) => ({ day }))
        : []
    const slots: Slot[] = []
    for (const r of rawSlots.slice(0, 21)) {
      const o = r as Record<string, unknown> | null
      if (!o || typeof o !== 'object') continue
      const day = o.day
      if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 6) continue
      const start = isTime(o.start) ? o.start : ''
      const end = start && isTime(o.end) && o.end > start ? o.end : ''
      if (!slots.some((x) => x.day === day && x.start === start)) slots.push({ day, start, end })
    }
    const notes: Record<string, string> = {}
    if (c.notes && typeof c.notes === 'object')
      for (const [k, v] of Object.entries(c.notes as Record<string, unknown>))
        if (absences.includes(k) && typeof v === 'string' && v.trim()) notes[k] = v.trim().slice(0, MAX_NOTE)
    courses.push({ id, name, limit, color, slots, absences, notes })
  }
  return { version: 1, courses }
}

/** Eski sürümden kalan yerel veriyi okur (buluta taşımak için). */
export function loadData(): AppData {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (!text) return emptyData()
    return sanitize(JSON.parse(text)) ?? emptyData()
  } catch {
    return emptyData()
  }
}

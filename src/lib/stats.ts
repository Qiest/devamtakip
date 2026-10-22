import type { Course } from '../types'

export type Tone = 'none' | 'ok' | 'warn' | 'bad'

export function courseStats(c: Course) {
  const count = c.absences.length
  if (c.limit === null) return { count, remaining: null, tone: 'none' as Tone, text: 'Limit belirlenmedi' }
  const remaining = c.limit - count
  const tone: Tone = remaining <= 0 ? 'bad' : remaining === 1 ? 'warn' : 'ok'
  const text =
    remaining > 0 ? `${remaining} hak kaldı` : remaining === 0 ? 'Hak kalmadı' : `Limit ${-remaining} aşıldı`
  return { count, remaining, tone, text }
}

export const toneClass: Record<Tone, string> = {
  none: 'text-ink/60',
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-bad',
}
export const toneStroke: Record<Tone, string> = { none: '', ok: '#16875F', warn: '#D98A12', bad: '#C93C3C' }

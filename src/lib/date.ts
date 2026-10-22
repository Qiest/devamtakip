const pad = (n: number) => String(n).padStart(2, '0')

/** Yerel saate göre YYYY-MM-DD (toISOString UTC kayması yaratır, kullanılmaz). */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const todayISO = () => toISO(new Date())

export function isValidISO(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  if (y < 1900 || y > 2200) return false
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

/** YYYY-MM-DD → GG/AA/YYYY */
export function formatTR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function weekdayTR(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(new Date(y, m - 1, d))
}

/** Pazartesi başlayan gün listesi. id = JS getDay() değeri. */
export const DAYS = [
  { id: 1, short: 'Pzt', long: 'Pazartesi' },
  { id: 2, short: 'Sal', long: 'Salı' },
  { id: 3, short: 'Çar', long: 'Çarşamba' },
  { id: 4, short: 'Per', long: 'Perşembe' },
  { id: 5, short: 'Cum', long: 'Cuma' },
  { id: 6, short: 'Cmt', long: 'Cumartesi' },
  { id: 0, short: 'Paz', long: 'Pazar' },
]

export function dowOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return toISO(new Date(y, m - 1, d + n))
}

export function daysSummary(days: number[]): string {
  return days.length ? DAYS.filter((d) => days.includes(d.id)).map((d) => d.short).join(', ') : 'Her gün'
}

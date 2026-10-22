/** Dersin haftalık bir saati. day: 0 = Pazar ... 6 = Cumartesi; saatler 'SS:DD' ya da boş. */
export interface Slot {
  day: number
  start: string
  end: string
}

export interface Course {
  id: string
  name: string
  /** Ders için izin verilen en fazla devamsızlık; yoksa null */
  limit: number | null
  color: string
  /** Ders programı. Boşsa ders her gün görünür. */
  slots: Slot[]
  /** YYYY-MM-DD biçiminde, tekrarsız ve sıralı */
  absences: string[]
  /** Devamsızlık tarihine bağlı not: { '2026-10-22': 'hastaydım' } */
  notes: Record<string, string>
}

export interface AppData {
  version: 1
  courses: Course[]
}

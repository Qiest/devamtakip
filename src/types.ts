export interface Course {
  id: string
  name: string
  /** Ders için izin verilen en fazla devamsızlık; yoksa null */
  limit: number | null
  color: string
  /** Dersin olduğu günler (0 = Pazar ... 6 = Cumartesi). Boşsa her gün görünür. */
  days: number[]
  /** YYYY-MM-DD biçiminde, tekrarsız ve sıralı */
  absences: string[]
  /** Devamsızlık tarihine bağlı not: { '2026-10-22': 'hastaydım' } */
  notes: Record<string, string>
}

export interface AppData {
  version: 1
  courses: Course[]
}

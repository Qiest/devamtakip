export interface Course {
  id: string
  name: string
  /** Ders için izin verilen en fazla devamsızlık; yoksa null */
  limit: number | null
  color: string
  /** YYYY-MM-DD biçiminde, tekrarsız ve sıralı */
  absences: string[]
}

export interface AppData {
  version: 1
  courses: Course[]
}

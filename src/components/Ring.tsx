import type { Course } from '../types'
import { courseStats, toneStroke } from '../lib/stats'

export function Ring({ course }: { course: Course }) {
  const { count, tone } = courseStats(course)
  const r = 24, C = 2 * Math.PI * r
  const ratio = course.limit ? Math.min(count / course.limit, 1) : 1
  const stroke = course.limit ? toneStroke[tone] : course.color
  return (
    <div className="relative h-14 w-14 shrink-0" role="img" aria-label={course.limit ? `${count} / ${course.limit} devamsızlık` : `${count} devamsızlık`}>
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E3E8F0" strokeWidth="6" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - ratio)} opacity={course.limit || count ? 1 : 0.35} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-bold tabular-nums">{count}</span>
    </div>
  )
}

import { PROFILES, type Profile } from '../lib/profiles'
import { Logo } from '../components/icons'

const initials = (n: string) => n.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('')

export function ProfileView({ onPick }: { onPick: (p: Profile) => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-8 flex items-center gap-3"><Logo size={52} /><h1 className="text-2xl font-extrabold tracking-tight">DevamTakip</h1></div>
      <p className="mb-3 font-semibold">Kim kullanıyor?</p>
      <ul className="space-y-3">
        {PROFILES.map((p) => (
          <li key={p.id}>
            <button onClick={() => onPick(p)} className="flex w-full items-center gap-4 rounded-2xl border border-ink/10 bg-white p-4 text-left active:bg-mist">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-lg font-bold text-white">{initials(p.name)}</span>
              <span className="font-bold">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink/55">Seçimin bu cihazda hatırlanır. Herkesin verisi ayrı tutulur.</p>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { useData } from './hooks/useData'
import { isConfigured } from './lib/firebase'
import { getSavedProfile, saveProfile, type Profile } from './lib/profiles'
import { TrackView, type Notify } from './views/TrackView'
import { CoursesView } from './views/CoursesView'
import { HistoryView } from './views/HistoryView'
import { ProfileView } from './views/ProfileView'
import { BookIcon, CheckIcon, ClockIcon, Logo } from './components/icons'

type Tab = 'track' | 'courses' | 'history'
const TABS: { id: Tab; label: string; Icon: ComponentType }[] = [
  { id: 'track', label: 'Takip', Icon: CheckIcon },
  { id: 'courses', label: 'Dersler', Icon: BookIcon },
  { id: 'history', label: 'Geçmiş', Icon: ClockIcon },
]

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(getSavedProfile)
  if (!isConfigured)
    return (
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-bold">Firebase ayarı eksik</h1>
        <p className="mt-2 text-ink/70">Proje klasöründeki <code>.env</code> dosyasına Firebase bilgilerini yaz (README'de adımlar var), sonra yeniden derle.</p>
      </div>
    )
  if (!profile) return <ProfileView onPick={(p) => { saveProfile(p.id); setProfile(p) }} />
  return <Main key={profile.id} profile={profile} onSwitch={() => { saveProfile(null); setProfile(null) }} />
}

function Main({ profile, onSwitch }: { profile: Profile; onSwitch: () => void }) {
  const { data, loading, saveError, actions } = useData(profile.docId)
  const [tab, setTab] = useState<Tab>('track')
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const notify: Notify = useCallback((text, undo) => {
    setToast({ text, undo })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      <header className="pt-safe sticky top-0 z-20 bg-brand text-white">
        <div className="flex h-16 items-center gap-3 px-4">
          <Logo />
          <div className="min-w-0 leading-tight">
            <h1 className="text-lg font-extrabold tracking-tight">DevamTakip</h1>
            <p className="truncate text-xs text-white/75">{profile.name}</p>
          </div>
          <nav className="ml-auto hidden gap-1 md:flex" aria-label="Ana menü">
            {TABS.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
                className={`h-10 rounded-full px-4 font-semibold ${tab === id ? 'bg-white text-brand' : 'text-white/85 hover:bg-white/15'}`}>{label}</button>
            ))}
          </nav>
          <button onClick={onSwitch} className="ml-auto h-10 shrink-0 rounded-full px-3 text-sm font-semibold text-white/85 hover:bg-white/15 md:ml-1">Hesap değiştir</button>
        </div>
      </header>

      {saveError && (
        <div role="alert" className="mx-4 mt-4 rounded-xl bg-bad p-3 text-sm font-medium text-white">
          Değişiklikler buluta kaydedilemedi. İnternetini ve Firestore kurallarını kontrol et.
        </div>
      )}

      <main className="px-4 pb-32 pt-5 md:pb-12">
        {loading ? <p className="py-10 text-center text-ink/60">Yükleniyor…</p> : <>
        {tab === 'track' && <TrackView data={data} actions={actions} notify={notify} goCourses={() => setTab('courses')} />}
        {tab === 'courses' && <CoursesView data={data} actions={actions} />}
        {tab === 'history' && <HistoryView data={data} actions={actions} notify={notify} />}
        </>}
      </main>

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink px-4 py-3 text-white md:bottom-8">
          <span className="min-w-0 flex-1 text-sm">{toast.text}</span>
          {toast.undo && (
            <button className="font-bold text-[#9DB4FF]" onClick={() => { toast.undo?.(); setToast(null) }}>Geri al</button>
          )}
        </div>
      )}

      <nav aria-label="Ana menü" className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white md:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-3">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${tab === id ? 'text-brand' : 'text-ink/55'}`}>
              <Icon />{label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export interface Profile {
  id: string
  name: string
  /** Firestore'da bu kişinin verisinin durduğu kayıt. firestore.rules ile aynı olmalı. */
  docId: string
}

export const PROFILES: Profile[] = [
  { id: 'esma', name: 'Esma Ecrin Gürbüz', docId: 'd-IMxVwXdnzd7EtXOJIxC1vsb3' },
  { id: 'cihat', name: 'Cihat Ümmet Aksoy', docId: 'd-w5pHUVGADkCtGpfKK4FoeNFE' },
]

const KEY = 'devamtakip:profile'

export function getSavedProfile(): Profile | null {
  try {
    const id = localStorage.getItem(KEY)
    return PROFILES.find((p) => p.id === id) ?? null
  } catch {
    return null
  }
}

export function saveProfile(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY, id)
    else localStorage.removeItem(KEY)
  } catch {
    /* depolama kapalı olabilir */
  }
}

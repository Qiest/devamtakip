import type { ReactNode } from 'react'

const Svg = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
export const CheckIcon = () => <Svg><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M8.5 13l2.5 2.5 4.5-5" /></Svg>
export const BookIcon = () => <Svg><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v16H6.5A1.5 1.5 0 0 0 5 20.5v-16ZM5 20.5A1.5 1.5 0 0 0 6.5 22H19" /></Svg>
export const SaveIcon = () => <Svg><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></Svg>
export const PlusIcon = () => <Svg size={20}><path d="M12 5v14M5 12h14" /></Svg>
export const EditIcon = () => <Svg size={19}><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" /></Svg>
export const TrashIcon = () => <Svg size={19}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>
export const ChevronIcon = () => <Svg size={20}><path d="m9 6 6 6-6 6" /></Svg>
export const CloseIcon = () => <Svg size={20}><path d="M6 6l12 12M18 6 6 18" /></Svg>
export const UploadIcon = () => <Svg><path d="M12 15V3M7 8l5-5 5 5M4 20h16" /></Svg>

export const Logo = ({ size = 40 }: { size?: number }) => (
  <img src="/logo.png" width={size} height={size} alt="" className="rounded-full" />
)

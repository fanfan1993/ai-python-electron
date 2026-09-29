import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Mood } from '../types'

type User = { id: number; email: string; name: string }
type State = {
  token: string
  user: User | null
  activeView: 'today' | 'discover' | 'journal'
  chatOpen: boolean
  messages: ChatMessage[]
  mood: Mood | null
  energy: number
  note: string
  bookedDish: string | null
  toast: string | null
  setAuth: (token: string, user: User) => void
  signOut: () => void
  setView: (view: State['activeView']) => void
  toggleChat: () => void
  addMessage: (message: ChatMessage) => void
  setMood: (mood: Mood) => void
  setEnergy: (energy: number) => void
  setNote: (note: string) => void
  setBookedDish: (dish: string) => void
  showToast: (message: string) => void
  closeToast: () => void
}

export const useAppStore = create<State>()(persist((set) => ({
  token: '', user: null, activeView: 'today', chatOpen: false, messages: [], mood: null, energy: 3, note: '', bookedDish: null, toast: null,
  setAuth: (token, user) => set({ token, user }),
  signOut: () => set({ token: '', user: null }),
  setView: (activeView) => set({ activeView }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  addMessage: (message) => set((state) => ({
    messages: [
      ...(Array.isArray(state.messages) ? state.messages.filter(isStoredMessage) : []),
      message,
    ],
  })),
  setMood: (mood) => set({ mood }), setEnergy: (energy) => set({ energy }), setNote: (note) => set({ note }),
  setBookedDish: (bookedDish) => set({ bookedDish }),
  showToast: (toast) => { set({ toast }); window.setTimeout(() => set({ toast: null }), 2800) },
  closeToast: () => set({ toast: null }),
}), { name: 'morrow-app-v1', partialize: (state) => ({ token: state.token, user: state.user, messages: state.messages, mood: state.mood, energy: state.energy, note: state.note, bookedDish: state.bookedDish }) }))

function isStoredMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return typeof message.id === 'string'
    && (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && typeof message.time === 'string'
}

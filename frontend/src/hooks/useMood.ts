import { api } from '../api/client'
import { useAppStore } from '../store/useAppStore'

export function useMood() {
  const store = useAppStore()
  async function save() {
    if (!store.mood) { store.showToast('先选一个最接近此刻的心情吧'); return }
    if (store.token) {
      try { await api.mood({ mood: store.mood, energy: store.energy, note: store.note }, store.token) }
      catch { store.showToast('已保存在本地；连接服务后可同步') }
    }
    store.showToast('这一刻，已经好好收进你的日记里')
  }
  return { ...store, save }
}

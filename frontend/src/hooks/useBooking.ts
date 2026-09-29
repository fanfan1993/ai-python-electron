import { api } from '../api/client'
import { useAppStore } from '../store/useAppStore'

export function useBooking() {
  const { token, setBookedDish, showToast } = useAppStore()
  return async (dish: { id: string; name: string }) => {
    const now = new Date()
    const mealDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    try {
      if (token) await api.book({ dish_id: dish.id, dish_name: dish.name, meal_date: mealDate, meal_slot: '午餐' }, token)
    } catch { showToast('暂时无法连接服务，已为你保留本地预约意向') }
    setBookedDish(dish.name)
    showToast(`已为你记下今天的「${dish.name}」`)
  }
}

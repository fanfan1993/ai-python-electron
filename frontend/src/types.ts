export type Mood = '轻盈' | '平静' | '疲惫' | '期待' | '有点丧'
export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; time: string }
export type Dish = { id: string; name: string; description: string; category: string; price: number; image: string; tags: string[]; color: string }

export const dishes: Dish[] = [
  { id: '1', name: '山野菌菇鸡汤饭', description: '慢炖鸡汤 · 当季菌菇 · 杂粮饭', category: '暖胃补能', price: 32, image: 'photo-1547592180-85f173990554', tags: ['暖胃', '高蛋白'], color: '#dce5d2' },
  { id: '2', name: '青柠牛油果能量碗', description: '香煎牛肉 · 溏心蛋 · 藜麦', category: '清爽能量', price: 38, image: 'photo-1512621776951-a57141f2eefd', tags: ['清爽', '高蛋白'], color: '#dceadd' },
  { id: '3', name: '番茄海鲜烩面', description: '鲜虾蛤蜊 · 酸甜番茄汤底', category: '今日人气', price: 35, image: 'photo-1473093295043-cdd812d0e601', tags: ['热乎', '鲜味'], color: '#f1dfd2' },
]

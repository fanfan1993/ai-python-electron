import { useRef, useState } from 'react'
import { api } from '../api/client'
import { useAppStore } from '../store/useAppStore'

export function useChat() {
  const state = useAppStore()
  const messages = Array.isArray(state.messages)
    ? state.messages.filter(isChatMessage)
    : []
  const { addMessage, token, showToast } = state
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)

  async function send(text: string) {
    const content = text.trim()
    if (!content || sendingRef.current) return
    sendingRef.current = true
    setSending(true)
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    try {
      const history = messages.slice(-12).map(({ role, content: item }) => ({ role, content: item }))
      addMessage({ id: makeId(), role: 'user', content, time: now })

      let reply: string
      try {
        const result = token ? await api.chat(content, history, token) : await demoReply(content)
        reply = typeof result.reply === 'string' && result.reply.trim()
          ? result.reply
          : '我在听。你可以继续告诉我今天的心情或想吃什么。'
      } catch {
        reply = (await demoReply(content)).reply
        if (token) showToast('暂时连不上服务，先用演示回复陪你聊')
      }

      addMessage({ id: makeId(), role: 'assistant', content: reply, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) })
    } catch {
      showToast('这条消息暂时没有发送成功，请再试一次')
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }
  return { messages, send, sending }
}

function isChatMessage(value: unknown): value is { id: string; role: 'user' | 'assistant'; content: string; time: string } {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return typeof message.id === 'string'
    && (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && typeof message.time === 'string'
}

function makeId(): string {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function demoReply(message: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 720))
  if (/吃|餐|午饭|推荐|菜单/.test(message)) return { reply: '我会推荐今天的「山野菌菇鸡汤饭」：暖胃又有饱腹感，特别适合给忙碌的一天按下暂停键。要不要我帮你预约一份？' }
  if (/累|疲惫|压力|心情|难过/.test(message)) return { reply: '听起来今天不太容易。先不用急着把一切想明白，吃一顿舒服的饭、给自己一点空白，也是一种很好的照顾。你愿意说说今天发生什么了吗？' }
  return { reply: '我在呢。可以和我聊聊今天的心情，也可以让我根据你的口味和状态，帮你挑一份刚刚好的午餐。' }
}

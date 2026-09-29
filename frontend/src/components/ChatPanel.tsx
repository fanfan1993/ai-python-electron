import { ArrowUp, Bot, ChevronDown, LoaderCircle, MessageCircle, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useChat } from '../hooks/useChat'
import { useAppStore } from '../store/useAppStore'

export function ChatPanel() {
  const { chatOpen, toggleChat } = useAppStore()
  const { messages, send, sending } = useChat()
  const [text, setText] = useState('')
  const bottom = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = bottom.current
    if (typeof element?.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, sending])
  if (!chatOpen) return <button className="chat-fab" onClick={toggleChat}><MessageCircle size={20} /><span>问问 Morrow</span><i /></button>
  function submitMessage() {
    const message = text.trim()
    if (!message || sending) return
    setText('')
    void send(message)
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    submitMessage()
  }
  return <section className="chat-panel">
    <header className="chat-head"><div className="bot-avatar"><Sparkles size={17} /></div><div><strong>Morrow 陪伴助手</strong><span><i /> 随时都在</span></div><button className="icon-button" onClick={toggleChat}><ChevronDown size={19} /></button><button className="icon-button close-chat" onClick={toggleChat}><X size={18} /></button></header>
    <div className="chat-context"><span>✦</span> 关于吃什么、心情，或只是想说说话</div>
    <div className="chat-messages">
      {messages.length === 0 && <div className="chat-welcome"><div className="welcome-orb"><Bot size={24} /></div><h3>嘿，今天过得怎么样？</h3><p>我可以帮你挑一份好吃的，也可以安静听你说说话。</p><div className="suggestions">{['今天吃什么好？', '我有点累，想吃点暖和的', '帮我记下今天的心情'].map((hint) => <button key={hint} onClick={() => void send(hint)}>{hint}<ArrowUp size={13} /></button>)}</div></div>}
      {messages.map((message) => <div className={`message ${message.role}`} key={message.id}><div className="message-avatar">{message.role === 'assistant' ? <Sparkles size={13} /> : 'Y'}</div><div className="message-content"><p>{message.content}</p><time>{message.time}</time></div></div>)}
      {sending && <div className="message assistant"><div className="message-avatar"><Sparkles size={13} /></div><div className="typing"><i /><i /><i /></div></div>}
      <div ref={bottom} />
    </div>
    <div className="chat-input"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onInputKeyDown} placeholder="说说你在想什么…" /><button type="button" disabled={!text.trim() || sending} onClick={submitMessage} aria-label="发送"><ArrowUp size={18} /></button></div>
    <div className="chat-foot"><LoaderCircle size={11} /> 温柔对话，由 AI 与你的专属食记共同生成</div>
  </section>
}

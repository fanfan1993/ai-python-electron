import { ArrowRight, KeyRound, Mail, X } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api/client'
import { useAppStore } from '../store/useAppStore'

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { setAuth, showToast } = useAppStore()
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = mode === 'login' ? await api.login({ email, password }) : await api.register({ email, name, password })
      setAuth(result.access_token, result.user); showToast(`欢迎回来，${result.user.name}`); onClose()
    } catch (err) { setError(err instanceof Error ? err.message : '暂时无法连接服务，请稍后再试') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onClick={onClose}><section className="auth-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="brand-mark auth-mark"><KeyRound size={19} /></div><div className="eyebrow">YOUR PERSONAL SPACE</div><h2>{mode === 'login' ? '回来啦。' : '从今天开始，' }<br />{mode === 'register' && '好好照顾自己。'}</h2><p>登录后，预约和心情记录会安全地保存在你的空间里。</p><form onSubmit={submit}>{mode === 'register' && <label>怎么称呼你？<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="你的名字" /></label>}<label>邮箱地址<div className="field-icon"><Mail size={15} /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div></label><label>密码<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 8 位" /></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? '请稍候…' : mode === 'login' ? '登录我的空间' : '创建我的空间'}<ArrowRight size={16} /></button></form><div className="auth-switch">{mode === 'login' ? '还没有账号？' : '已经有账号了？'}<button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? '创建一个' : '去登录'}</button></div></section></div>
}

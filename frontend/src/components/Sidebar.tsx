import { BookHeart, Compass, LayoutDashboard, LogIn, LogOut, Sparkles, UtensilsCrossed } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function Sidebar({ onAuth }: { onAuth: () => void }) {
  const { activeView, setView, toggleChat, user, signOut, showToast } = useAppStore()
  const nav = [
    { id: 'today' as const, title: '今日时光', icon: LayoutDashboard },
    { id: 'discover' as const, title: '发现好味', icon: Compass },
    { id: 'journal' as const, title: '心情日记', icon: BookHeart },
  ]
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><Sparkles size={18} strokeWidth={1.8} /></div><span>morrow</span><small>每日食记</small></div>
    <div className="nav-label">SPACE</div>
    <nav>{nav.map(({ id, title, icon: Icon }) => <button className={`nav-item ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setView(id)}><Icon size={18} strokeWidth={1.8} /><span>{title}</span>{id === 'today' && activeView === id && <i />}</button>)}</nav>
    <button className="nav-item chat-link" onClick={toggleChat}><span className="chat-icon"><Sparkles size={16} /></span><span>和 AI 聊一聊</span><span className="online-dot" /></button>
    <div className="sidebar-spacer" />
    <div className="side-note"><div className="note-art">✳</div><p>生活不用太用力，<br />好好吃饭就很好。</p><span>— 今天也辛苦啦</span></div>
    <div className="profile-row"><div className="avatar">{user?.name?.[0] ?? 'Y'}</div><div className="profile-copy"><strong>{user?.name ?? '午后漫游者'}</strong><span>{user ? '已连接个人空间' : '正在体验演示空间'}</span></div>{user ? <button className="icon-button" title="退出登录" onClick={() => { signOut(); showToast('已退出登录') }}><LogOut size={16} /></button> : <button className="icon-button" title="登录或注册" onClick={onAuth}><LogIn size={16} /></button>}</div>
    <div className="sidebar-bottom"><span><UtensilsCrossed size={12} /> made for your everyday</span><span>v.01</span></div>
  </aside>
}

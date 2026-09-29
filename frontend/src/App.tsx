import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Flame, Heart, Leaf, MoreHorizontal, Plus, Sparkles, Sun } from 'lucide-react'
import { useState } from 'react'
import { AuthModal } from './components/AuthModal'
import { ChatPanel } from './components/ChatPanel'
import { Sidebar } from './components/Sidebar'
import { WeatherCard } from './components/WeatherCard'
import { useBooking } from './hooks/useBooking'
import { useMood } from './hooks/useMood'
import { useAppStore } from './store/useAppStore'
import { dishes, type Mood } from './types'

const moods: { mood: Mood; face: string; className: string; copy: string }[] = [
  { mood: '轻盈', face: '☀️', className: 'sunny', copy: '像有微风' },
  { mood: '平静', face: '🌿', className: 'calm', copy: '慢慢来' },
  { mood: '疲惫', face: '🌙', className: 'tired', copy: '想充充电' },
  { mood: '期待', face: '✨', className: 'excited', copy: '有好事发生' },
  { mood: '有点丧', face: '☁️', className: 'cloudy', copy: '需要被抱抱' },
]

function App() {
  const { activeView, setView, user, mood, energy, note, setMood, setEnergy, setNote, showToast, toast } = useAppStore()
  const book = useBooking()
  const moodActions = useMood()
  const [authOpen, setAuthOpen] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const today = new Date()
  const date = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  const heading = activeView === 'today' ? '今天，先照顾好自己。' : activeView === 'discover' ? '让好味道带来一点灵感。' : '给心情一个停靠的地方。'
  const subhead = activeView === 'today' ? '一顿好好吃的饭，一次诚实的感受。今天从这里开始。' : activeView === 'discover' ? '不必想太多，跟着今天的胃口走就好。' : '不需要写得完整，只要记下此刻的你。'

  async function saveMood() { await moodActions.save(); if (!mood) return; setJustSaved(true); window.setTimeout(() => setJustSaved(false), 2400) }

  return <div className="app-shell">
    <Sidebar onAuth={() => setAuthOpen(true)} />
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>MY EVERYDAY</span><span className="crumb-slash">/</span><strong>{activeView === 'today' ? 'TODAY' : activeView === 'discover' ? 'DISCOVER' : 'JOURNAL'}</strong></div><div className="topbar-right"><div className="date-chip"><Sun size={15} /><span>{date}</span></div><button className="top-avatar" onClick={() => user ? showToast(`你好，${user.name}`) : setAuthOpen(true)}>{user?.name?.[0] ?? 'Y'}<i /></button></div></header>
      <div className="page-content">
        <section className="page-intro"><div><div className="eyebrow"><span className="eyebrow-dot" /> A LITTLE CARE, EVERY DAY</div><h1>{heading}</h1><p>{subhead}</p></div><button className="day-counter"><span>YOUR DAY</span><strong>{String(today.getDate()).padStart(2, '0')}<small> / {String(today.getMonth() + 1).padStart(2, '0')}</small></strong><ArrowUpRight size={16} /></button></section>

        {activeView === 'journal' ? <section className="journal-view">
          <div className="section-heading"><div><div className="section-kicker">A MOMENT WITH YOURSELF</div><h2>此刻的心情</h2></div><span className="muted-label">只属于你的小小记录</span></div>
          <div className="mood-layout"><div className="mood-card journal-card"><div className="mood-card-top"><div><span className="tiny-cap">01 — CHECK IN</span><h3>现在感觉怎么样？</h3><p>没有对错，选一个最接近的就好。</p></div><span className="sun-doodle">✳</span></div><div className="mood-options">{moods.map((item) => <button key={item.mood} className={`mood-option ${mood === item.mood ? 'selected' : ''}`} onClick={() => setMood(item.mood)}><span className={`mood-face ${item.className}`}>{item.face}</span><strong>{item.mood}</strong><small>{item.copy}</small></button>)}</div><div className="energy-row"><div><span className="tiny-cap">02 — YOUR ENERGY</span><h4>今天的电量</h4></div><div className="energy-meter">{[1, 2, 3, 4, 5].map((level) => <button key={level} className={energy >= level ? 'filled' : ''} onClick={() => setEnergy(level)} aria-label={`${level}格电量`} />)}<span>{['需要慢一点', '有点低', '还不错', '挺充沛', '能量满满'][energy - 1]}</span></div></div><label className="note-label"><span className="tiny-cap">03 — A FEW WORDS <small>OPTIONAL</small></span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="有什么想留给今天的自己？写几个字也可以…" /></label><button className={`primary-button save-mood ${justSaved ? 'saved' : ''}`} onClick={() => void saveMood()}>{justSaved ? <><Check size={16} /> 已记下这一刻</> : <>把这一刻收好 <ArrowRight size={16} /></>}</button></div><aside className="journal-aside"><div className="aside-art"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><div className="moon-shape">☾</div><div className="art-star star-one">✳</div><div className="art-star star-two">✦</div></div><div className="aside-quote"><span className="tiny-cap">A GENTLE REMINDER</span><p>“你不需要每天<br />都很闪耀。<br /><em>安静地做自己，</em><br />也很了不起。”</p><span>给今天的你 ♡</span></div><div className="streak-card"><div className="streak-icon"><Flame size={17} /></div><div><strong>1 天</strong><span>记录自己的开始</span></div><ArrowUpRight size={15} /></div></aside></div>
        </section> : activeView === 'discover' ? <section className="discover-view"><div className="discover-banner"><div><span className="tiny-cap">TODAY'S TABLE · 03 DISHES</span><h2>好好吃饭，<br />也可以很简单。</h2><p>按照你的心情和胃口，挑一份刚刚好的。</p></div><div className="banner-sun">☼<small>fresh<br />today</small></div><div className="banner-stamp">当日<br />鲜作<br /><i>✳</i></div></div><div className="section-heading dish-section-head"><div><div className="section-kicker">PICKED FOR YOUR DAY</div><h2>今天的好味道</h2></div><button className="text-button" onClick={() => showToast('这里每天都会有新灵感 ✦')}>查看全部 <ArrowRight size={15} /></button></div><div className="dish-grid">{dishes.map((dish, i) => <DishCard key={dish.id} dish={dish} index={i} booked={useAppStore.getState().bookedDish === dish.name} onBook={() => void book(dish)} />)}</div></section> : <>
          <section className="hero-grid">
            <div className="hero-card"><img className="hero-image" src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="一碗暖心的鸡汤和菌菇" /><div className="hero-wash" /><div className="hero-grain" /><div className="hero-topline"><span><i /> TODAY'S LITTLE RITUAL</span><button aria-label="更多"><MoreHorizontal size={20} /></button></div><div className="hero-copy"><span className="tiny-cap">01 — NOURISH YOURSELF</span><h2>给自己一顿<br /><em>刚刚好的</em>午餐。</h2><p>好好吃饭，是今天最温柔的待办事项。</p><button className="hero-cta" onClick={() => setView('discover')}>发现今日推荐 <ArrowRight size={16} /></button></div><div className="hero-sticker"><span>made with</span><Heart size={15} fill="currentColor" /><span>care</span></div><div className="hero-pagination"><i className="selected" /><i /><i /><span>01 <small>/ 03</small></span></div></div>
            <aside className="side-stack"><WeatherCard city="上海" /><div className="prompt-card"><span className="prompt-icon"><Sparkles size={17} /></span><div><span className="tiny-cap">A QUESTION FOR YOU</span><h4>今天，有什么<br />值得期待的小事？</h4></div><button className="prompt-arrow" onClick={() => setView('journal')}><ArrowDownRight size={17} /></button><span className="prompt-star">✳</span></div></aside>
          </section>

          <section className="today-lower"><div className="food-section"><div className="section-heading"><div><div className="section-kicker">MADE FOR YOUR MOOD</div><h2>今天吃点什么 <span>✳</span></h2></div><button className="text-button" onClick={() => setView('discover')}>全部推荐 <ArrowRight size={15} /></button></div><div className="dish-grid">{dishes.map((dish, i) => <DishCard key={dish.id} dish={dish} index={i} booked={useAppStore.getState().bookedDish === dish.name} onBook={() => void book(dish)} />)}</div></div>
            <aside className="mood-widget"><div className="widget-heading"><div><div className="section-kicker">A MOMENT FOR YOU</div><h3>此刻的心情</h3></div><button className="icon-button" onClick={() => setView('journal')}><ArrowUpRight size={17} /></button></div><p className="widget-prompt">不赶时间的话，<br />来和今天的自己打个招呼？</p><div className="mood-mini-list">{moods.slice(0, 4).map((item) => <button key={item.mood} className={`mood-mini ${mood === item.mood ? 'chosen' : ''}`} onClick={() => setMood(item.mood)} title={item.mood}><span>{item.face}</span></button>)}<button className="mood-mini more" onClick={() => setView('journal')}><Plus size={18} /></button></div><button className="mood-checkin" onClick={() => setView('journal')}>{mood ? `今天的你：${mood}` : '记录一下此刻'}<ArrowRight size={15} /></button><div className="widget-bottom"><span><span className="widget-heart">♡</span> 给自己留一点空间</span><span>{mood ? '已打卡' : '约 1 分钟'}</span></div></aside></section>
          <section className="bottom-ribbon"><div className="ribbon-mark"><Leaf size={16} /></div><p>「生活不是一场冲刺。」<span>慢慢吃，慢慢感受，慢慢成为自己。</span></p><button onClick={() => setView('journal')}>留一点时间给自己 <ArrowRight size={15} /></button><div className="ribbon-orb" /></section>
        </>}
        <footer className="page-footer"><span>© MORROW DAILY RITUALS</span><span>吃好一点，也对自己好一点。 <Heart size={11} /></span></footer>
      </div>
    </main>
    <ChatPanel />
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    {toast && <div className="toast"><span><Check size={14} /></span>{toast}</div>}
  </div>
}

function DishCard({ dish, index, booked, onBook }: { dish: typeof dishes[number]; index: number; booked: boolean; onBook: () => void }) {
  const [liked, setLiked] = useState(false)
  return <article className={`dish-card dish-${index + 1}`}><div className="dish-photo-wrap"><img src={`https://images.unsplash.com/${dish.image}?auto=format&fit=crop&w=640&q=80`} alt={dish.name} loading="lazy" /><span className="dish-category">{dish.category}</span><button className={`dish-like ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)} aria-label={liked ? '取消收藏' : '收藏'}><Heart size={15} fill={liked ? 'currentColor' : 'none'} /></button>{index === 0 && <span className="dish-recommend"><Sparkles size={11} /> FOR YOU</span>}</div><div className="dish-info"><div className="dish-tags">{dish.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="dish-title-row"><h3>{dish.name}</h3><span>¥{dish.price}</span></div><p>{dish.description}</p><button className={`dish-book ${booked ? 'booked' : ''}`} onClick={onBook}>{booked ? <><Check size={14} /> 已预约</> : <>预约这份午餐 <ArrowRight size={14} /></>}</button></div></article>
}

export default App

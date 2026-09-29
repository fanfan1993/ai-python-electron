import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Morrow UI error', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="app-error-page" role="alert">
          <span>✳</span>
          <h1>刚刚有一点小状况</h1>
          <p>你的记录还在。刷新一下，我们继续。</p>
          <button onClick={() => window.location.reload()}>重新打开</button>
        </main>
      )
    }
    return this.props.children
  }
}

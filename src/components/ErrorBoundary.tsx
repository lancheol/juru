import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('게임 렌더 오류:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h1>오류가 발생했습니다</h1>
          <p>페이지를 새로고침해 주세요.</p>
          <button type="button" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

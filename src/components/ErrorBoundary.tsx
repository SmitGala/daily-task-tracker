import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-dvh items-center justify-center p-6">
          <div className="glass max-w-md w-full rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle className="h-7 w-7 text-danger" />
            </div>
            <h1 className="text-xl font-semibold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <Button onClick={this.handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    if (import.meta.env.DEV) {
      console.group('Error Boundary Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 rounded-xl shadow-2xl shadow-cyan-500/10 border border-cyan-500/20 p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-500/10 p-4 rounded-full border-2 border-red-500/30">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-400 text-center mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
              Try refreshing the page or returning to the home page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-700">
                <h3 className="text-sm font-semibold text-red-400 mb-2">
                  Error Details (Development Mode):
                </h3>
                <pre className="text-xs text-gray-400 overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 border border-slate-700"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-xs text-gray-400 text-center">
                If this problem persists, please contact support or check the browser console for more details.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

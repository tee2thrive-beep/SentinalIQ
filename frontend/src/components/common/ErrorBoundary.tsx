import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SentinelIQ Frontend ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-[#111827] border border-rose-900/50 p-8 rounded-2xl text-center space-y-4 shadow-2xl">
            <div className="inline-flex p-3 bg-rose-500/20 text-rose-400 rounded-full">
              <AlertOctagon className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold font-mono text-rose-200">Application Error Encountered</h2>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              An unexpected UI exception occurred in SentinelIQ Workspace.
            </p>
            {this.state.error && (
              <div className="p-3 bg-black/60 rounded-lg text-[11px] font-mono text-rose-300 text-left overflow-x-auto border border-rose-950">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload SentinelIQ Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

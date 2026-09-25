import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight text-white">Something Went Wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                CampusRide encountered a temporary render issue. Click below to refresh your session.
              </p>
              {this.state.error && (
                <div className="pt-2">
                  <p className="text-[11px] font-mono text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-500/30 max-w-sm mx-auto overflow-auto max-h-28 text-left break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition hover:opacity-90 shadow-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-950" />
              Reload CampusRide
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

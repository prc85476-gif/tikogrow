import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[FoxTask ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6128]/10 border border-[#FF6128]/30 flex items-center justify-center text-[#FF6128] mb-4 shadow-lg shadow-[#FF6128]/20">
            <span className="text-2xl font-black">⚠️</span>
          </div>
          <h2 className="text-xl font-black text-white">Something went wrong</h2>
          <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
            {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
          <div className="flex items-center space-x-3 mt-6">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-[#FF6128] hover:bg-[#FF7533] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#FF6128]/30"
            >
              Reload View
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


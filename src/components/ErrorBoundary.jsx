import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught runtime error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-6 text-center space-y-4 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Something went wrong loading this view
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected display error occurred while rendering the page content.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-primary text-xs inline-flex items-center gap-1.5 w-full sm:w-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                Reload page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-secondary text-xs inline-flex items-center gap-1.5 w-full sm:w-auto"
              >
                <Home className="h-3.5 w-3.5 text-slate-600" strokeWidth={1.75} />
                Return to home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

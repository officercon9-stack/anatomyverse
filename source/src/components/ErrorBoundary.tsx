// @ts-nocheck
import * as React from 'react';

export var ErrorBoundary = class extends React.Component {
  state = {
    error: null,
  };
  static getDerivedStateFromError(e) {
    return {
      error: e,
    };
  }
  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="grid min-h-[50vh] place-items-center p-6" role="alert">
            <div className="av-card max-w-md p-6">
              <h1 className="mb-2 text-lg font-semibold">Something went wrong</h1>
              <p className="text-sm text-[var(--av-text-muted)]">
                An unexpected error occurred on this page. Your saved progress is not affected. Try reloading; if the
                problem continues, please report it.
              </p>
              <button type="button" className="av-btn av-btn--primary mt-4" onClick={() => window.location.reload()}>
                Reload page
              </button>
            </div>
          </div>
        )
      );
    } else {
      return this.props.children;
    }
  }
};

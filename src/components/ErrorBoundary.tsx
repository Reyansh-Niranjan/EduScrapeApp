import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  didAutoReload?: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    const message = String((error as any)?.message ?? "");
    const looksLikeChunkLoadFailure =
      /ChunkLoadError|Loading chunk\s+\d+\s+failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
        message
      );

    if (looksLikeChunkLoadFailure) {
      try {
        const key = "eduscrape:autoReloadedAfterChunkError";
        const alreadyReloaded = sessionStorage.getItem(key) === "1";
        if (!alreadyReloaded) {
          sessionStorage.setItem(key, "1");
          this.setState({ didAutoReload: true });
          window.setTimeout(() => window.location.reload(), 250);
        }
      } catch {
        // If sessionStorage is blocked, don't risk a reload loop.
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const showDebugDetails = (() => {
        try {
          return new URLSearchParams(window.location.search).get("debug") === "1";
        } catch {
          return false;
        }
      })();

      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="bg-card border border-border rounded-md p-8 max-w-md text-center shadow-lg space-y-4">
              <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-md flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {this.state.didAutoReload
                  ? "We hit a loading error. Reloading..."
                  : "We encountered an unexpected error. Please refresh the page or try again later."}
              </p>

              {showDebugDetails && this.state.error?.message ? (
                <div className="rounded-md border border-border bg-secondary p-3 text-left">
                  <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Debug</div>
                  <div className="text-xs font-mono text-foreground break-words">{this.state.error.message}</div>
                </div>
              ) : null}

              <div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-primary-foreground py-2 px-5 rounded-md text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

import { Component, type ErrorInfo, type ReactNode } from 'react';

type SilentErrorBoundaryProps = {
  children: ReactNode;
  /** What to render once a child has thrown. Defaults to nothing. */
  fallback?: ReactNode;
};

type SilentErrorBoundaryState = { failed: boolean };

/**
 * Contains a render-time throw to the subtree it wraps.
 *
 * Use it around a leaf that renders content the current page does not own —
 * for example another space's author-written markdown inside a card on this
 * space's page. Without a boundary here, a throw from that leaf propagates to
 * the application root boundary and replaces the whole route with the error
 * page for every viewer; with it, only that one piece degrades to `fallback`.
 *
 * Silent to the viewer, not to the team: the caught error is handed to the
 * browser's global error channel (`reportError`), which the host application's
 * error monitoring already listens on — the design system never imports it.
 */
export class SilentErrorBoundary extends Component<SilentErrorBoundaryProps, SilentErrorBoundaryState> {
  state: SilentErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SilentErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

import { Component, type ReactNode } from 'react';

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
 * Containment only: the error is not reported from here. Anything that should
 * be logged belongs to the leaf itself.
 */
export class SilentErrorBoundary extends Component<SilentErrorBoundaryProps, SilentErrorBoundaryState> {
  state: SilentErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SilentErrorBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

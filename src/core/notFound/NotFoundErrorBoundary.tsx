import React from 'react';

interface Props extends React.PropsWithChildren {
  errorComponent: React.ReactNode;
  resetKey?: string | number | boolean;
}

interface State {
  hasError: boolean;
}

export class NotFoundErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: error instanceof NotFoundError,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      // Reset the error state when the reset key changes (e.g., on navigation)
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.errorComponent;
    }
    return this.props.children;
  }
}

export class NotFoundError extends Error {}

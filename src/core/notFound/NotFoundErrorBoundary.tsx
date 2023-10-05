import React from 'react';

interface Props {
  errorComponent: React.ReactNode;
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
    if (error instanceof NotFoundError) {
      return { hasError: true };
    } else {
      return { hasError: false };
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

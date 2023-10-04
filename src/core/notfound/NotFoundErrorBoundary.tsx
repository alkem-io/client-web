import React from 'react';

interface Props {
  errorComponent: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class NotFoundErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    console.log('NotFoundErrorBoundary constructor');
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    if (error instanceof NotFoundError) {
      console.log('getDerivedStateFromError: true', error);
      return { hasError: true, error };
    } else {
      console.log('getDerivedStateFromError: false', error);
      return { hasError: false, error: null };
    }
  }

  componentDidCatch(error, info) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    console.log('componentDidCatch', { error, info });
    // logErrorToMyService(error, info.componentStack);
  }

  render() {
    console.log('NotFoundErrorBoundary RENDER', this.state);
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.errorComponent;
    }
    return this.props.children;
  }
}

export class NotFoundError extends Error {}

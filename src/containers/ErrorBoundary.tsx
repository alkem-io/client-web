import React, { ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends React.Component<Record<string, unknown>, { error?: Error; errorInfo?: ErrorInfo }> {
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = { error: undefined, errorInfo: undefined };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });
  }

  render(): ReactNode {
    const { error, errorInfo } = this.state;
    const { children } = this.props;
    if (errorInfo) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {error && error.toString()}
            <br />
            {errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return children;
  }
}

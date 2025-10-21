import React from 'react';
import { useLocation } from 'react-router-dom';

interface Props extends React.PropsWithChildren {
  errorComponent: React.ReactNode;
}

interface InternalProps extends Props {
  pathname: string;
}

interface State {
  hasError: boolean;
  pathname?: string;
}

class NotFoundErrorBoundaryInternal extends React.Component<InternalProps, State> {
  constructor(props: InternalProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: error instanceof NotFoundError,
    };
  }

  static getDerivedStateFromProps(props: InternalProps, state: State) {
    // Reset error state when location changes
    const currentPathname = props.pathname;
    if (currentPathname && currentPathname !== state.pathname) {
      return {
        hasError: false,
        pathname: currentPathname,
      };
    }
    return { pathname: currentPathname };
  }

  render() {
    if (this.state.hasError) {
      return this.props.errorComponent;
    }
    return this.props.children;
  }
}

// Wrapper component to inject location into the error boundary
export const NotFoundErrorBoundary = (props: Props) => {
  const location = useLocation();
  return <NotFoundErrorBoundaryInternal {...props} pathname={location.pathname} />;
};

export class NotFoundError extends Error {}

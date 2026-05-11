import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AncestorRedirectDispatcher } from '@/main/crdPages/error/AncestorRedirectDispatcher';
import { setNavigationHistoryError } from '../routing/NavigationHistory';
import { type ClosestAncestor, NotAuthorizedError, NotFoundError } from './40XErrors';

interface Props extends React.PropsWithChildren {
  errorComponent: (errorState: State) => React.ReactNode;
}

interface InternalProps extends Props {
  pathname: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  isNotFound?: boolean;
  isNotAuthorized?: boolean;
  pathname?: string;
  redirectUrl?: string; // Redirect to this URL immediately if set
  closestAncestor?: ClosestAncestor; // Show a dialog that will redirect to this URL after countdown
}

// Permanent React Compiler exception: React requires class components for error boundaries (no hook equivalent).
class Error40XBoundaryInternal extends React.Component<InternalProps, State> {
  constructor(props: InternalProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    setNavigationHistoryError(window.location.pathname + window.location.search + window.location.hash);

    // Update state so the next render will show the fallback UI.
    if (error instanceof NotFoundError) {
      return {
        hasError: true,
        error,
        isNotFound: true,
        isNotAuthorized: false,
        redirectUrl: error.redirectUrl,
        closestAncestor: error.closestAncestor,
      };
    } else if (error instanceof NotAuthorizedError) {
      return {
        hasError: true,
        error,
        isNotFound: false,
        isNotAuthorized: true,
        redirectUrl: error.redirectUrl,
        closestAncestor: error.closestAncestor,
      };
    } else {
      // Any other error:
      return {
        hasError: true,
        error,
        isNotFound: false,
        isNotAuthorized: false,
        redirectUrl: undefined,
        closestAncestor: undefined,
      };
    }
  }

  static getDerivedStateFromProps(props: InternalProps, state: State) {
    // Reset error state when location changes
    const currentPathname = props.pathname;
    if (currentPathname && currentPathname !== state.pathname) {
      return {
        hasError: false,
        error: undefined,
        pathname: currentPathname,
        isNotFound: false,
        isNotAuthorized: false,
        redirectUrl: undefined,
        closestAncestor: undefined,
      };
    }
    return { pathname: currentPathname };
  }

  render() {
    if (this.state.hasError) {
      if (this.state.redirectUrl) {
        return <Navigate to={this.state.redirectUrl} />;
      }
      return (
        <>
          {this.props.errorComponent(this.state)}
          {this.state.closestAncestor && (
            <AncestorRedirectDispatcher
              closestAncestor={this.state.closestAncestor}
              isNotAuthorized={this.state.isNotAuthorized}
            />
          )}
        </>
      );
    }
    return this.props.children;
  }
}

// Wrapper component to inject location into the error boundary
export const Error40XBoundary = (props: Props) => {
  const location = useLocation();
  return <Error40XBoundaryInternal {...props} pathname={location.pathname} />;
};

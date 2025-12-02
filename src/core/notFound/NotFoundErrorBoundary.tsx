import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { RedirectToAncestorDialog } from './RedirectToAncestorDialog';
import { UrlType } from '../apollo/generated/graphql-schema';

interface Props extends React.PropsWithChildren {
  errorComponent: React.ReactNode;
}

interface InternalProps extends Props {
  pathname: string;
}

interface ClosestAncestor {
  url: string;
  type: UrlType;
  space?: {
    id: string;
  };
}

interface State {
  hasError: boolean;
  pathname?: string;
  redirectUrl?: string; // Redirect to this URL immediately if set
  closestAncestor?: ClosestAncestor; // Show a dialog that will redirect to this URL after countdown
}

class NotFoundErrorBoundaryInternal extends React.Component<InternalProps, State> {
  constructor(props: InternalProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    if (error instanceof NotFoundError) {
      return {
        hasError: true,
        redirectUrl: error.redirectUrl,
        closestAncestor: error.closestAncestor,
      };
    } else {
      return { hasError: false, redirectUrl: undefined, closestAncestor: undefined };
    }
  }

  static getDerivedStateFromProps(props: InternalProps, state: State) {
    // Reset error state when location changes
    const currentPathname = props.pathname;
    if (currentPathname && currentPathname !== state.pathname) {
      return {
        hasError: false,
        pathname: currentPathname,
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
          {this.props.errorComponent}
          {this.state.closestAncestor && <RedirectToAncestorDialog closestAncestor={this.state.closestAncestor} />}
        </>
      );
    }
    return this.props.children;
  }
}

// Wrapper component to inject location into the error boundary
export const NotFoundErrorBoundary = (props: Props) => {
  const location = useLocation();
  return <NotFoundErrorBoundaryInternal {...props} pathname={location.pathname} />;
};

export class NotFoundError extends Error {
  public closestAncestor?: ClosestAncestor;
  public redirectUrl?: string;
  constructor(params?: { redirectUrl?: string; closestAncestor?: ClosestAncestor }) {
    super('Not Found');
    this.closestAncestor = params?.closestAncestor;
    this.redirectUrl = params?.redirectUrl;
  }
}

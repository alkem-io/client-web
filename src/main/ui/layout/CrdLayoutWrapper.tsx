import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0]?.[0] ?? '').toUpperCase();
}

const NAVIGATION_HREFS = {
  home: `/${TopLevelRoutePath.Home}`,
  spaces: `/${TopLevelRoutePath.Spaces}`,
  messages: `/${TopLevelRoutePath.Home}`,
  notifications: `/${TopLevelRoutePath.Home}`,
  profile: `/${TopLevelRoutePath.Profile}`,
  settings: `/${TopLevelRoutePath.Profile}`,
};

function CrdLayoutConnector() {
  const { isAuthenticated, userModel } = useCurrentUserContext();

  const user = userModel?.profile
    ? {
        name: userModel.profile.displayName,
        avatarUrl: userModel.profile.avatar?.uri,
        initials: getInitials(userModel.profile.displayName),
      }
    : undefined;

  const handleLogout = () => {
    window.location.href = '/identity/logout';
  };

  return (
    <CrdLayout user={user} authenticated={isAuthenticated} navigationHrefs={NAVIGATION_HREFS} onLogout={handleLogout}>
      <Outlet />
    </CrdLayout>
  );
}

// Error boundary to catch CRD rendering errors gracefully
class CrdErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRD layout error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong loading this page.</h2>
          <p>
            <a href="/" style={{ color: '#09BCD4' }}>
              Return home
            </a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CrdLayoutWrapper() {
  return (
    <CrdErrorBoundary>
      <CrdLayoutConnector />
    </CrdErrorBoundary>
  );
}

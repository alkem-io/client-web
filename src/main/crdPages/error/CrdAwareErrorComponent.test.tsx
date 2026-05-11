import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({
  default: () => navigateMock,
}));

const usePageTitleMock = vi.fn();
vi.mock('@/core/routing/usePageTitle', () => ({
  usePageTitle: (title: string | undefined) => usePageTitleMock(title),
}));

const useCrdEnabledMock = vi.fn();
vi.mock('@/main/crdPages/useCrdEnabled', () => ({
  useCrdEnabled: () => useCrdEnabledMock(),
}));

const hasInAppHistoryMock = vi.fn();
vi.mock('@/main/crdPages/error/hasInAppHistory', () => ({
  hasInAppHistory: () => hasInAppHistoryMock(),
}));

vi.mock('@/main/crdPages/error/isCrdRoute', () => ({
  isCrdRoute: (pathname: string) => {
    if (!pathname) return false;
    if (pathname === '/admin' || pathname.startsWith('/admin/')) return false;
    return pathname.startsWith('/welcome-space') || pathname === '/home' || pathname === '/restricted';
  },
}));

vi.mock('@/main/routing/TopLevelRoutePath', () => ({
  TopLevelRoutePath: { Home: 'home' },
}));

vi.mock('@/crd/components/error/CrdForbiddenPage', () => ({
  CrdForbiddenPage: ({
    title,
    onGoHome,
    onGoBack,
    showGoBack,
  }: {
    title: string;
    description: string;
    goHomeLabel: string;
    goBackLabel: string;
    onGoHome: () => void;
    onGoBack?: () => void;
    showGoBack?: boolean;
  }) => (
    <div data-testid="crd-forbidden-page">
      <h1>{title}</h1>
      <button type="button" onClick={onGoHome} data-testid="go-home">
        go home
      </button>
      {showGoBack && onGoBack && (
        <button type="button" onClick={onGoBack} data-testid="go-back">
          go back
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/main/ui/layout/CrdLayoutWrapper', () => ({
  CrdLayoutWrapper: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="crd-layout-wrapper">{children}</div>
  ),
}));

vi.mock('@/main/ui/layout/TopLevelLayout', () => ({
  default: ({ children }: { children?: React.ReactNode }) => <div data-testid="mui-layout">{children}</div>,
}));

vi.mock('@/core/pages/Errors/Error40X', () => ({
  Error40X: (props: { isNotAuthorized?: boolean; isNotFound?: boolean }) => (
    <div
      data-testid="mui-error40x"
      data-not-authorized={String(props.isNotAuthorized ?? false)}
      data-not-found={String(props.isNotFound ?? false)}
    >
      mui error
    </div>
  ),
}));

import { CrdAwareErrorComponent } from './CrdAwareErrorComponent';

describe('CrdAwareErrorComponent', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    usePageTitleMock.mockReset();
    useCrdEnabledMock.mockReset();
    hasInAppHistoryMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders CRD page when toggle is on, route is CRD, and isNotAuthorized=true', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('crd-layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('crd-forbidden-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('forbidden.title');
    expect(screen.queryByTestId('mui-layout')).not.toBeInTheDocument();
  });

  test('renders MUI fallback when current pathname is NOT a CRD route (e.g. /admin), even with toggle on', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/admin" isNotAuthorized={true} hasError={true} />);

    expect(screen.queryByTestId('crd-forbidden-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('mui-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mui-error40x')).toHaveAttribute('data-not-authorized', 'true');
  });

  test('renders MUI fallback when CRD toggle is off, even on a CRD route', () => {
    useCrdEnabledMock.mockReturnValue(false);
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.queryByTestId('crd-forbidden-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('mui-layout')).toBeInTheDocument();
  });

  test('renders MUI fallback for isNotFound (CRD 404 is out of scope)', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotFound={true} hasError={true} />);

    expect(screen.queryByTestId('crd-forbidden-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('mui-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mui-error40x')).toHaveAttribute('data-not-found', 'true');
  });

  test('does not crash when pathname is undefined; falls back to MUI', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent isNotAuthorized={true} hasError={true} />);

    expect(screen.queryByTestId('crd-forbidden-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('mui-layout')).toBeInTheDocument();
  });

  test('hides "Go back" button when hasInAppHistory returns false', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('go-home')).toBeInTheDocument();
    expect(screen.queryByTestId('go-back')).not.toBeInTheDocument();
  });

  test('shows "Go back" button when hasInAppHistory returns true', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('go-back')).toBeInTheDocument();
  });

  test('sets the document title via usePageTitle', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(usePageTitleMock).toHaveBeenCalledWith('forbidden.title');
  });

  test('clicking "Go to Home" navigates to /home', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);
    screen.getByTestId('go-home').click();

    expect(navigateMock).toHaveBeenCalledWith('/home');
  });

  test('clicking "Go back" navigates(-1)', () => {
    useCrdEnabledMock.mockReturnValue(true);
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);
    screen.getByTestId('go-back').click();

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});

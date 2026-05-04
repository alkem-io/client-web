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

const useTransactionScopeMock = vi.fn();
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({
  useTransactionScope: (scope: { type: string }) => useTransactionScopeMock(scope),
}));

const queryParamsGetMock = vi.fn();
vi.mock('@/core/routing/useQueryParams', () => ({
  useQueryParams: () => ({ get: (key: string) => queryParamsGetMock(key) }),
}));

const logInfoMock = vi.fn();
vi.mock('@/core/logging/sentry/log', () => ({
  info: (message: string) => logInfoMock(message),
}));

const hasInAppHistoryMock = vi.fn();
vi.mock('@/main/crdPages/error/hasInAppHistory', () => ({
  hasInAppHistory: () => hasInAppHistoryMock(),
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
    goHomeLabel,
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
        {goHomeLabel}
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

import { CrdRestrictedRoute } from './CrdRestrictedRoute';

describe('CrdRestrictedRoute', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    usePageTitleMock.mockReset();
    useTransactionScopeMock.mockReset();
    queryParamsGetMock.mockReset();
    logInfoMock.mockReset();
    hasInAppHistoryMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('logs Sentry breadcrumb with the origin query parameter', () => {
    queryParamsGetMock.mockReturnValue('/some/page');
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);

    expect(logInfoMock).toHaveBeenCalledTimes(1);
    expect(logInfoMock).toHaveBeenCalledWith('Attempted access to: /some/page');
  });

  test('logs "Attempted access to: null" when origin parameter is absent', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);

    expect(logInfoMock).toHaveBeenCalledWith('Attempted access to: null');
  });

  test('renders the CRD forbidden page heading', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('forbidden.title');
  });

  test('primary "Go to Home" button has correct label and navigates to /home', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);
    const goHome = screen.getByTestId('go-home');
    expect(goHome).toHaveTextContent('forbidden.actions.goHome');

    goHome.click();
    expect(navigateMock).toHaveBeenCalledWith('/home');
  });

  test('useTransactionScope is called with { type: "authentication" }', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);

    expect(useTransactionScopeMock).toHaveBeenCalledWith({ type: 'authentication' });
  });

  test('"Go back" button is shown when hasInAppHistory returns true', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdRestrictedRoute />);
    const goBack = screen.getByTestId('go-back');
    expect(goBack).toBeInTheDocument();

    goBack.click();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  test('"Go back" button is hidden when hasInAppHistory returns false', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);

    expect(screen.queryByTestId('go-back')).not.toBeInTheDocument();
  });

  test('sets the document title via usePageTitle', () => {
    queryParamsGetMock.mockReturnValue(null);
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdRestrictedRoute />);

    expect(usePageTitleMock).toHaveBeenCalledWith('forbidden.title');
  });
});

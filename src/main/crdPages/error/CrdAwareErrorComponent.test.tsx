import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: (_ns?: string) => ({
    t: (key: string) => key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

const sentryErrorMock = vi.fn();
vi.mock('@/core/logging/sentry/log', () => ({
  error: (...args: unknown[]) => sentryErrorMock(...args),
  TagCategoryValues: { UI: 'UI' },
}));

vi.mock('@/main/constants/endpoints', () => ({
  privateGraphQLEndpoint: 'http://localhost/graphql',
}));

vi.mock('@/crd/components/error/CrdErrorPage', () => ({
  CrdErrorPage: ({
    title,
    reloadLabel,
    onReload,
  }: {
    title: string;
    description: React.ReactNode;
    reloadLabel: string;
    onReload: () => void;
  }) => (
    <div data-testid="crd-error-page">
      <h1>{title}</h1>
      <button type="button" onClick={onReload} data-testid="reload">
        {reloadLabel}
      </button>
    </div>
  ),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({
  default: () => navigateMock,
}));

const usePageTitleMock = vi.fn();
vi.mock('@/core/routing/usePageTitle', () => ({
  usePageTitle: (title: string | undefined) => usePageTitleMock(title),
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

vi.mock('@/main/crdPages/error/CrdNotFoundBranch', () => ({
  CrdNotFoundBranch: () => <div data-testid="crd-not-found-branch">crd not found</div>,
}));

vi.mock('@/main/ui/layout/CrdLayoutWrapper', () => ({
  CrdLayoutWrapper: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="crd-layout-wrapper">{children}</div>
  ),
}));

import { CrdAwareErrorComponent } from './CrdAwareErrorComponent';

describe('CrdAwareErrorComponent', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    usePageTitleMock.mockReset();
    hasInAppHistoryMock.mockReset();
    sentryErrorMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the CRD forbidden page when isNotAuthorized=true', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('crd-forbidden-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('forbidden.title');
  });

  test('renders the CRD forbidden page regardless of pathname (CRD is the only path)', () => {
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/admin" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('crd-forbidden-page')).toBeInTheDocument();
  });

  test('renders the CRD 404 when isNotFound=true', () => {
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotFound={true} hasError={true} />);

    expect(screen.getByTestId('crd-not-found-branch')).toBeInTheDocument();
    expect(screen.queryByTestId('crd-forbidden-page')).not.toBeInTheDocument();
  });

  test('renders the CRD 404 for isNotFound regardless of pathname', () => {
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/admin" isNotFound={true} hasError={true} />);

    expect(screen.getByTestId('crd-not-found-branch')).toBeInTheDocument();
  });

  test('renders the CRD 404 for isNotFound when pathname is undefined', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent isNotFound={true} hasError={true} />);

    expect(screen.getByTestId('crd-not-found-branch')).toBeInTheDocument();
  });

  test('renders the CRD 404 as the safe default when no flag/error is provided', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" hasError={true} />);

    expect(screen.getByTestId('crd-not-found-branch')).toBeInTheDocument();
  });

  test('renders the forbidden page even when pathname is undefined', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('crd-forbidden-page')).toBeInTheDocument();
  });

  test('hides "Go back" button when hasInAppHistory returns false', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('go-home')).toBeInTheDocument();
    expect(screen.queryByTestId('go-back')).not.toBeInTheDocument();
  });

  test('shows "Go back" button when hasInAppHistory returns true', () => {
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(screen.getByTestId('go-back')).toBeInTheDocument();
  });

  test('sets the document title via usePageTitle', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);

    expect(usePageTitleMock).toHaveBeenCalledWith('forbidden.title');
  });

  test('clicking "Go to Home" navigates to /home', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);
    screen.getByTestId('go-home').click();

    expect(navigateMock).toHaveBeenCalledWith('/home');
  });

  test('clicking "Go back" navigates(-1)', () => {
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdAwareErrorComponent pathname="/welcome-space" isNotAuthorized={true} hasError={true} />);
    screen.getByTestId('go-back').click();

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  test('renders the CRD generic error page for a generic error', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/welcome-space" error={new Error('boom')} hasError={true} />);

    expect(screen.getByTestId('crd-error-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('genericError.title');
    expect(usePageTitleMock).toHaveBeenCalledWith('genericError.title');
    expect(sentryErrorMock).toHaveBeenCalledTimes(1);
  });

  test('renders the CRD generic error page for a generic error regardless of pathname', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdAwareErrorComponent pathname="/admin" error={new Error('boom')} hasError={true} />);

    expect(screen.getByTestId('crd-error-page')).toBeInTheDocument();
  });
});

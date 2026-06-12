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

const log404NotFoundMock = vi.fn();
vi.mock('@/core/logging/sentry/log', () => ({
  log404NotFound: () => log404NotFoundMock(),
}));

const hasInAppHistoryMock = vi.fn();
vi.mock('@/main/crdPages/error/hasInAppHistory', () => ({
  hasInAppHistory: () => hasInAppHistoryMock(),
}));

vi.mock('@/main/routing/TopLevelRoutePath', () => ({
  TopLevelRoutePath: { Home: 'home' },
}));

vi.mock('@/crd/components/error/CrdNotFoundPage', () => ({
  CrdNotFoundPage: ({
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
    <div data-testid="crd-not-found-page">
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

import { CrdNotFoundBranch } from './CrdNotFoundBranch';

describe('CrdNotFoundBranch', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    usePageTitleMock.mockReset();
    log404NotFoundMock.mockReset();
    hasInAppHistoryMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the CRD 404 page inside the CRD layout wrapper', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdNotFoundBranch />);

    expect(screen.getByTestId('crd-layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('crd-not-found-page')).toBeInTheDocument();
  });

  test('logs the 404 to Sentry exactly once on mount', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdNotFoundBranch />);

    expect(log404NotFoundMock).toHaveBeenCalledTimes(1);
  });

  test('sets the document title via usePageTitle to notFound.title', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdNotFoundBranch />);

    expect(usePageTitleMock).toHaveBeenCalledWith('notFound.title');
  });

  test('hides "go back" when there is no in-app history', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdNotFoundBranch />);

    expect(screen.getByTestId('go-home')).toBeInTheDocument();
    expect(screen.queryByTestId('go-back')).not.toBeInTheDocument();
  });

  test('shows "go back" when there is in-app history and navigates(-1)', () => {
    hasInAppHistoryMock.mockReturnValue(true);

    render(<CrdNotFoundBranch />);
    screen.getByTestId('go-back').click();

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  test('clicking "go home" navigates to /home', () => {
    hasInAppHistoryMock.mockReturnValue(false);

    render(<CrdNotFoundBranch />);
    screen.getByTestId('go-home').click();

    expect(navigateMock).toHaveBeenCalledWith('/home');
  });
});

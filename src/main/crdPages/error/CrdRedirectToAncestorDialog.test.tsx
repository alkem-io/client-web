import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { UrlType } from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && typeof opts === 'object' ? `${key}::${JSON.stringify(opts)}` : key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span data-testid="trans">{i18nKey}</span>,
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({
  default: () => navigateMock,
}));

const useSpaceCardQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceCardQuery: (args: unknown) => useSpaceCardQueryMock(args),
}));

// Render the CRD presentational dialog as a flat tree so the test can poke
// the props directly without dragging in Radix portals / overlays.
vi.mock('@/crd/components/error/CrdRedirectDialog', () => ({
  CrdRedirectDialog: ({
    open,
    onOpenChange,
    title,
    countdownLabel,
    cancelCountdownLabel,
    goNowLabel,
    cancelled,
    onCancelCountdown,
    onGoNow,
    ancestorSlot,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: React.ReactNode;
    countdownLabel?: string;
    cancelCountdownLabel?: string;
    goNowLabel: string;
    cancelled: boolean;
    onCancelCountdown: () => void;
    onGoNow: () => void;
    ancestorSlot?: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="dialog">
        <h2>{title}</h2>
        {ancestorSlot && <div data-testid="ancestor-slot">{ancestorSlot}</div>}
        {!cancelled && (
          <span data-testid="countdown">
            {countdownLabel}
            <button type="button" onClick={onCancelCountdown} data-testid="cancel-countdown">
              {cancelCountdownLabel}
            </button>
          </span>
        )}
        <button type="button" onClick={onGoNow} data-testid="go-now">
          {goNowLabel}
        </button>
        <button type="button" onClick={() => onOpenChange(false)} data-testid="close-dialog">
          close
        </button>
      </div>
    ) : null,
}));

// Strip the Avatar/Skeleton primitives down so the slot test isn't sensitive
// to their internals.
vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children }: { children?: React.ReactNode }) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children }: { children?: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
  AvatarImage: ({ src }: { src?: string }) => <img alt="" data-testid="avatar-image" src={src} />,
}));
vi.mock('@/crd/primitives/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

import { CrdRedirectToAncestorDialog } from './CrdRedirectToAncestorDialog';

const ancestor: ClosestAncestor = {
  url: '/welcome-space',
  type: UrlType.Space,
  space: { id: 'space-1' },
};

describe('CrdRedirectToAncestorDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockReset();
    useSpaceCardQueryMock.mockReset();
    useSpaceCardQueryMock.mockReturnValue({ data: undefined, loading: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('renders the dialog with title and Go Now action when first mounted', () => {
    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('components.urlResolver.redirectDialog.title');
    expect(screen.getByTestId('go-now')).toHaveTextContent('components.urlResolver.redirectDialog.goNow');
  });

  test('passes seconds=10 to the countdown label on first render', () => {
    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    expect(screen.getByTestId('countdown')).toHaveTextContent('"seconds":10');
  });

  test('navigates to the ancestor URL when "Go Now" is clicked', () => {
    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    act(() => {
      screen.getByTestId('go-now').click();
    });

    expect(navigateMock).toHaveBeenCalledWith('/welcome-space');
  });

  test('decrements seconds each tick and navigates to ancestor when countdown hits 0', () => {
    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    // Tick 9 seconds — countdown should still be active
    act(() => {
      vi.advanceTimersByTime(9000);
    });
    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('countdown')).toHaveTextContent('"seconds":1');

    // Tick the final second — should navigate
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(navigateMock).toHaveBeenCalledWith('/welcome-space');
  });

  test('cancels the countdown when cancel-countdown is clicked', () => {
    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    act(() => {
      screen.getByTestId('cancel-countdown').click();
    });

    // After cancel, the countdown text is hidden by the dialog's `cancelled` flag
    expect(screen.queryByTestId('countdown')).not.toBeInTheDocument();

    // Advancing timers must not navigate
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('closes the dialog when onOpenChange(false) fires; timer no longer navigates', () => {
    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    act(() => {
      screen.getByTestId('close-dialog').click();
    });

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  test('renders ancestor slot skeleton while space card is loading', () => {
    useSpaceCardQueryMock.mockReturnValue({ data: undefined, loading: true });

    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    expect(screen.getByTestId('ancestor-slot')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  test('renders ancestor slot with space display name once query resolves', () => {
    useSpaceCardQueryMock.mockReturnValue({
      data: {
        lookup: {
          space: {
            id: 'space-1',
            level: 0,
            about: {
              profile: {
                id: 'profile-1',
                url: '/welcome-space',
                displayName: 'Welcome Space',
                avatar: undefined,
                cardBanner: undefined,
              },
            },
          },
        },
      },
      loading: false,
    });

    render(<CrdRedirectToAncestorDialog closestAncestor={ancestor} />);

    const slot = screen.getByTestId('ancestor-slot');
    expect(slot).toHaveTextContent('Welcome Space');
  });

  test('does not render ancestor slot when ancestor is not a Space', () => {
    const nonSpaceAncestor: ClosestAncestor = {
      url: '/some-non-space-url',
      type: UrlType.User,
    };

    render(<CrdRedirectToAncestorDialog closestAncestor={nonSpaceAncestor} />);

    expect(screen.queryByTestId('ancestor-slot')).not.toBeInTheDocument();
  });
});

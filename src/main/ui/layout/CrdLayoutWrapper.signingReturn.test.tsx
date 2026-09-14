import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lazy, type ReactNode, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CalloutContributionType,
  CalloutFramingType,
  SigningAttemptStatus,
} from '@/core/apollo/generated/graphql-schema';
import { AUTH_REQUIRED_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import { MemoEditorShell } from '@/crd/components/memo/MemoEditorShell';
import { CrdCalloutDialogFromUrl } from '@/main/crdPages/space/callout/CrdCalloutDialogFromUrl';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';
import { CrdLayoutWrapper } from './CrdLayoutWrapper';

const state = vi.hoisted(() => ({
  authLoading: false,
  userId: 'user-1',
  attemptError: undefined as { networkError?: Error } | undefined,
  attemptLoading: false,
  attemptStatus: 'SIGNED' as SigningAttemptStatus,
  attemptResponseId: undefined as string | undefined,
  attemptHasDocument: true,
  taskBoardEnabled: false,
  boardResult: false,
  boardResolutionPending: false,
  editorAlreadyOpen: false,
  calloutLoading: false,
  calloutAvailable: true,
  realCalloutPortal: false,
  routeHasCallout: true,
  calloutKind: 'framing' as 'framing' | 'contribution',
  calloutId: 'callout-1',
  attemptQuery: vi.fn(),
  attemptFetch: vi.fn(),
  verify: vi.fn(),
  plainChildMounted: vi.fn(),
  forbiddenReturnUrlObserved: vi.fn(),
}));

const returnStorageKey = (attemptId: string) => `alkemio.memo-signing-return.v1:${attemptId}`;

const callout = () => ({
  id: state.calloutId,
  calloutsSetId: 'callouts-set-1',
  draft: false,
  contributions: [],
  authorization: { myPrivileges: [] },
  framing: {
    type: CalloutFramingType.Memo,
    profile: { displayName: 'Decision memo' },
    memo: { id: 'framing-memo-1', markdown: 'Decision' },
  },
  settings: {
    framing: { commentsEnabled: true },
    contribution: {
      allowedTypes: [state.taskBoardEnabled ? CalloutContributionType.Post : CalloutContributionType.Memo],
      enabled: true,
      commentsEnabled: true,
    },
  },
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { count?: number }) => (values?.count === undefined ? key : `${key}:${values.count}`),
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useMemoSigningAttemptQuery: (options: { variables: { attemptID: string }; skip: boolean }) => {
    state.attemptQuery(options);
    useEffect(() => {
      if (!options.skip) {
        state.attemptFetch(options.variables.attemptID);
      }
    }, [options.skip, options.variables.attemptID]);
    if (options.skip) return { data: undefined, loading: false, error: undefined };
    if (state.attemptLoading) return { data: undefined, loading: true, error: undefined };
    if (state.attemptError) return { data: undefined, loading: false, error: state.attemptError };
    return {
      data: {
        signingAttempt: {
          id: state.attemptResponseId ?? options.variables.attemptID,
          status: state.attemptStatus,
          document: state.attemptHasDocument
            ? {
                id: 'signed-document-1',
                url: '/api/private/signed-document-1',
                displayName: 'Signed decision.pdf',
              }
            : undefined,
          actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
          updatedDate: '2026-09-14T09:00:00.000Z',
        },
      },
      loading: false,
      error: undefined,
    };
  },
  useVerifyMemoSignatureLazyQuery: () => [state.verify, { loading: false, data: undefined, error: undefined }],
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    loading: state.authLoading,
    userModel: state.authLoading ? undefined : { id: state.userId, profile: { displayName: 'Alice Example' } },
  }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('@/main/ui/layout/useCrdUser', () => ({
  useCrdUser: () => ({
    user: { name: 'Alice Example', initials: 'AE' },
    userModel: { id: state.userId },
    isAuthenticated: true,
    isAdmin: false,
  }),
}));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({}) }));
vi.mock('@/main/ui/layout/useCrdNavigation', () => ({
  useCrdNavigation: () => ({
    navigationHrefs: {},
    footerLinks: [],
    languages: [],
    currentLanguage: 'en',
    currentPath: '/',
    handleLanguageChange: vi.fn(),
    platformNavigationItems: [],
  }),
}));
vi.mock('@/main/inAppNotifications/InAppNotificationsContext', () => ({
  useInAppNotificationsContext: () => ({ setIsOpen: vi.fn() }),
}));
vi.mock('@/main/inAppNotifications/useInAppNotifications', () => ({
  useInAppNotifications: () => ({ unreadCount: 0 }),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ setIsOpen: vi.fn() }),
}));
vi.mock('@/main/userMessaging/useUnreadConversationsCount', () => ({ useUnreadConversationsCount: () => 0 }));
vi.mock('@/domain/community/pendingMembership/PendingMembershipsDialogContext', () => ({
  PendingMembershipsDialogType: { PendingMembershipsList: 'list' },
  usePendingMembershipsDialog: () => ({ setOpenDialog: vi.fn() }),
}));
vi.mock('@/domain/community/pendingMembership/usePendingInvitationsCount', () => ({
  usePendingInvitationsCount: () => ({ count: 0 }),
}));
vi.mock('@/main/search/SearchContext', () => ({
  SearchProvider: ({ children }: { children: ReactNode }) => children,
  useSearch: () => ({ openSearch: vi.fn() }),
}));
vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({
  BreadcrumbsProvider: ({ children }: { children: ReactNode }) => children,
  useBreadcrumbs: () => [],
}));
vi.mock('@/main/ui/layout/BannerOverlayContext', () => ({
  BannerOverlayProvider: ({ children }: { children: ReactNode }) => children,
  useBannerOverlay: () => undefined,
}));
vi.mock('@/main/ui/layout/LayoutWidthContext', () => ({
  LayoutWidthProvider: ({ children }: { children: ReactNode }) => children,
  useSpaceFullWidthActive: () => false,
}));
vi.mock('@/main/ui/layout/useDownNoticeBanner', () => ({
  useDownNoticeBanner: () => ({ visible: false, dismiss: vi.fn() }),
}));
vi.mock('@/core/lazyLoading/lazyWithGlobalErrorHandler', () => ({
  lazyWithGlobalErrorHandler: () => () => null,
}));
vi.mock('@/crd/layouts/CrdLayout', () => ({
  CrdLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/crd/lib/markdownConfig', () => ({
  MarkdownConfigProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/domain/language/LanguageOfferBannerConnector', () => ({ LanguageOfferBannerConnector: () => null }));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({
    providerPresent: true,
    calloutId: state.routeHasCallout ? state.calloutId : undefined,
    calloutsSetId: 'callouts-set-1',
    contributionId: state.calloutKind === 'contribution' ? 'contribution-1' : undefined,
    postId: undefined,
    loading: false,
  }),
}));
vi.mock('@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails', () => ({
  default: () => ({
    callout: state.calloutAvailable && !state.calloutLoading ? callout() : undefined,
    loading: state.calloutLoading,
  }),
}));
vi.mock('@/crd/components/callout/task-board/taskBoard', () => ({
  isTaskBoardEnabled: () => state.taskBoardEnabled,
}));
vi.mock('@/main/crdPages/space/callout/TaskBoardConnector', () => ({
  TaskBoardConnector: ({ onBoardResolved }: { onBoardResolved: (board: boolean) => void }) => {
    const resolutionPending = state.boardResolutionPending;
    useEffect(() => {
      if (!resolutionPending) onBoardResolved(state.boardResult);
    }, [onBoardResolved, resolutionPending]);
    return null;
  },
}));
vi.mock('@/main/crdPages/space/callout/TaskBoardDialog', () => ({
  TaskBoardDialog: () => <div data-testid="task-board">task board</div>,
}));
vi.mock('@/main/crdPages/space/callout/CalloutDetailDialogConnector', () => ({
  CalloutDetailDialogConnector: (props: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialContributionId?: string;
    memoSigningRestore?: {
      attemptId: string;
      kind: 'framing' | 'contribution';
      memoId: string;
      contributionId?: string;
    };
    onMemoSigningRestoreConsumed?: (attemptId: string, focusTarget?: HTMLElement) => void;
  }) => {
    const [editorKind, setEditorKind] = useState<'framing' | 'contribution' | undefined>(() =>
      state.editorAlreadyOpen ? state.calloutKind : undefined
    );

    useEffect(() => {
      if (props.memoSigningRestore) {
        setEditorKind(props.memoSigningRestore.kind);
      }
    }, [props.memoSigningRestore]);

    if (state.realCalloutPortal) {
      return (
        <CalloutDetailDialog
          open={props.open ?? true}
          onOpenChange={props.onOpenChange ?? vi.fn()}
          callout={{ id: state.calloutId, title: 'Delayed callout' }}
          commentsSlot={<div />}
          onShareClick={vi.fn()}
        />
      );
    }

    return (
      <div data-testid="callout-dialog">
        {editorKind && (
          <MemoEditorShell
            open={true}
            title={`Restored ${editorKind} memo editor`}
            onMounted={focusTarget => {
              if (props.memoSigningRestore?.kind === editorKind) {
                props.onMemoSigningRestoreConsumed?.(props.memoSigningRestore.attemptId, focusTarget);
              }
            }}
            onClose={() => setEditorKind(undefined)}
          >
            <button type="button" data-testid={`${editorKind}-memo-editor`}>
              {editorKind === 'contribution'
                ? `${props.memoSigningRestore?.contributionId}:${props.memoSigningRestore?.memoId}`
                : props.memoSigningRestore?.memoId}
            </button>
          </MemoEditorShell>
        )}
      </div>
    );
  },
}));
vi.mock('@/main/crdPages/memo/downloadMemoSignaturePdf', () => ({ downloadMemoSignaturePdf: vi.fn() }));

const storeContext = (
  kind: 'framing' | 'contribution',
  attemptId = 'attempt-1',
  overrides: Record<string, unknown> = {}
) => {
  window.sessionStorage.setItem(
    returnStorageKey(attemptId),
    JSON.stringify({
      version: 1,
      expiresAt: Date.now() + 60_000,
      attemptId,
      userId: state.userId,
      memoId: kind === 'framing' ? 'framing-memo-1' : 'contribution-memo-1',
      kind,
      calloutId: state.calloutId,
      ...(kind === 'contribution' ? { contributionId: 'contribution-1' } : {}),
      ...overrides,
    })
  );
};

const renderRoute = () =>
  render(
    <BrowserRouter>
      <CrdLayoutWrapper>
        <CrdCalloutDialogFromUrl onClose={vi.fn()} />
      </CrdLayoutWrapper>
    </BrowserRouter>
  );

function PlainRouteChild() {
  const location = useLocation();
  const forbiddenReturnUrl = `${AUTH_REQUIRED_PATH}${buildReturnUrlParam(
    `${location.pathname}${location.search}${location.hash}`
  )}`;
  state.forbiddenReturnUrlObserved(forbiddenReturnUrl);

  useEffect(() => {
    state.plainChildMounted();
  }, []);

  return (
    <>
      <output data-testid="router-search">{location.search}</output>
      <output data-testid="forbidden-return-url">{forbiddenReturnUrl}</output>
    </>
  );
}

function ReplaceTokenBeforeCapture() {
  useLayoutEffect(() => {
    globalThis.history.replaceState(null, '', '/dashboard?signingAttemptId=attempt-2');
  }, []);

  return null;
}

const renderPlainRoute = () =>
  render(
    <BrowserRouter>
      <CrdLayoutWrapper>
        <PlainRouteChild />
      </CrdLayoutWrapper>
    </BrowserRouter>
  );

beforeEach(() => {
  state.authLoading = false;
  state.userId = 'user-1';
  state.attemptError = undefined;
  state.attemptLoading = false;
  state.attemptStatus = SigningAttemptStatus.Signed;
  state.attemptResponseId = undefined;
  state.attemptHasDocument = true;
  state.taskBoardEnabled = false;
  state.boardResult = false;
  state.boardResolutionPending = false;
  state.editorAlreadyOpen = false;
  state.calloutLoading = false;
  state.calloutAvailable = true;
  state.realCalloutPortal = false;
  state.routeHasCallout = true;
  state.calloutKind = 'framing';
  state.calloutId = 'callout-1';
  state.attemptQuery.mockClear();
  state.attemptFetch.mockClear();
  state.verify.mockClear();
  state.plainChildMounted.mockClear();
  state.forbiddenReturnUrlObserved.mockClear();
  window.sessionStorage.clear();
  globalThis.history.replaceState(null, '', '/space/collaboration/callout-1');
});

describe('CrdLayoutWrapper memo-signing return lifecycle', () => {
  it('self-settles a signing return when no route-modal claimant is mounted', async () => {
    state.routeHasCallout = false;
    globalThis.history.replaceState(null, '', '/dashboard?signingAttemptId=attempt-1');

    renderPlainRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
  });

  it('router-synchronizes token consumption without remounting or querying the attempt twice', async () => {
    state.routeHasCallout = false;
    globalThis.history.replaceState(null, '', '/dashboard?keep=1&signingAttemptId=attempt-1#decision');

    renderPlainRoute();

    await waitFor(() => expect(screen.getByTestId('router-search')).toHaveTextContent('?keep=1'));
    expect(globalThis.location.search).toBe('?keep=1');
    expect(globalThis.location.hash).toBe('#decision');
    const forbiddenReturnUrl = decodeURI(screen.getByTestId('forbidden-return-url').textContent ?? '');
    expect(forbiddenReturnUrl).toContain('/dashboard?keep=1#decision');
    expect(forbiddenReturnUrl).not.toContain('signingAttemptId');
    const observedReturnUrls = state.forbiddenReturnUrlObserved.mock.calls.map(([value]) => decodeURI(value));
    expect(observedReturnUrls[0]).toContain('signingAttemptId=attempt-1');
    expect(observedReturnUrls.at(-1)).not.toContain('signingAttemptId');
    expect(state.plainChildMounted).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(state.attemptFetch).toHaveBeenCalledTimes(1));
    expect(state.attemptFetch).toHaveBeenCalledWith('attempt-1');
  });

  it('does not clobber a newer live token that arrives before the capture effect runs', async () => {
    state.routeHasCallout = false;
    globalThis.history.replaceState(null, '', '/dashboard?signingAttemptId=attempt-1');

    render(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <ReplaceTokenBeforeCapture />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    await waitFor(() => expect(globalThis.location.search).toBe('?signingAttemptId=attempt-2'));
    expect(state.attemptFetch).not.toHaveBeenCalled();
  });

  it('keeps a callout route pending while its lazy route claimant has not mounted', async () => {
    let resolveRoute: (() => void) | undefined;
    const LazyCalloutRoute = lazy(
      () =>
        new Promise<{ default: typeof CrdCalloutDialogFromUrl }>(resolve => {
          resolveRoute = () => resolve({ default: CrdCalloutDialogFromUrl });
        })
    );
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    render(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <Suspense fallback={<span>Loading callout route</span>}>
            <LazyCalloutRoute onClose={vi.fn()} />
          </Suspense>
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(screen.getByText('Loading callout route')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();

    await act(async () => resolveRoute?.());

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
  });

  it('keeps a context-free result foreground when the real callout portal mounts after callback capture', async () => {
    const user = userEvent.setup();
    state.realCalloutPortal = true;
    state.calloutLoading = true;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    const view = renderRoute();
    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();

    state.calloutLoading = false;
    view.rerender(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <CrdCalloutDialogFromUrl onClose={vi.fn()} />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    await screen.findByRole('button', { name: 'calloutDialog.share', hidden: true });
    const resultDialog = screen.getByText('memo.signing.savedTitle').closest('[role="dialog"]') as HTMLElement;
    expect(resultDialog).not.toHaveAttribute('aria-hidden', 'true');
    expect(resultDialog).not.toHaveStyle({ pointerEvents: 'none' });
    expect(resultDialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Delayed callout' })).toBeInTheDocument();
  });

  it('settles a context-free return when the route has no callout modal to mount', async () => {
    state.calloutAvailable = false;
    globalThis.history.replaceState(null, '', '/space/collaboration/missing?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Delayed callout' })).not.toBeInTheDocument();
  });

  it('keeps the result foreground when late restoration mounts a real editor portal', async () => {
    const user = userEvent.setup();
    storeContext('framing');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    const resultTitle = await screen.findByText('memo.signing.savedTitle');
    const resultDialog = resultTitle.closest('[role="dialog"]') as HTMLElement;
    expect(await screen.findByText('Restored framing memo editor')).toBeInTheDocument();
    expect(resultDialog).not.toHaveAttribute('aria-hidden', 'true');
    expect(resultDialog).not.toHaveStyle({ pointerEvents: 'none' });
    expect(resultDialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();
    const editorDialog = screen.getByRole('dialog', { name: 'Restored framing memo editor' });
    expect(editorDialog).toBeInTheDocument();
    expect(editorDialog).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByTestId('framing-memo-editor')).toBeInTheDocument();
  });

  it('keeps the result foreground when the real editor portal was already open before return', async () => {
    const user = userEvent.setup();
    state.editorAlreadyOpen = true;
    const view = renderRoute();
    expect(await screen.findByRole('dialog', { name: 'Restored framing memo editor' })).toBeInTheDocument();

    storeContext('framing');
    await act(async () => {
      globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');
      globalThis.dispatchEvent(new PopStateEvent('popstate'));
    });
    view.rerender(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <CrdCalloutDialogFromUrl onClose={vi.fn()} />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    const resultDialog = (await screen.findByText('memo.signing.savedTitle')).closest('[role="dialog"]') as HTMLElement;
    expect(resultDialog).not.toHaveAttribute('aria-hidden', 'true');
    expect(resultDialog).not.toHaveStyle({ pointerEvents: 'none' });
    expect(resultDialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();
    const editorDialog = screen.getByRole('dialog', { name: 'Restored framing memo editor' });
    expect(editorDialog).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByTestId('framing-memo-editor')).toBeInTheDocument();
  });

  it.each([
    'framing',
    'contribution',
  ] as const)('shows the first %s return above the restored editor and leaves that editor open after close', async kind => {
    const user = userEvent.setup();
    state.calloutKind = kind;
    storeContext(kind);
    globalThis.history.replaceState(
      null,
      '',
      '/space/collaboration/callout-1?keep=1&signingAttemptId=attempt-1#decision'
    );

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.getByTestId(`${kind}-memo-editor`)).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(globalThis.location.search).toBe('?keep=1');
    expect(globalThis.location.hash).toBe('#decision');

    await user.click(
      screen.getAllByRole('button', { name: 'memo.close' }).find(button => button.textContent) as HTMLElement
    );

    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();
    expect(screen.getByTestId(`${kind}-memo-editor`)).toBeInTheDocument();
  });

  it.each([
    'framing',
    'contribution',
  ] as const)('shows a context-free %s result without guessing an editor', async kind => {
    state.calloutKind = kind;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contribution-memo-editor')).not.toBeInTheDocument();
  });

  it('captures and strips the token before auth settles, then reads and deletes context exactly once', async () => {
    state.authLoading = true;
    storeContext('framing');
    const storagePrototype = Object.getPrototypeOf(window.sessionStorage);
    const getItem = vi.spyOn(storagePrototype, 'getItem');
    const removeItem = vi.spyOn(storagePrototype, 'removeItem');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    const view = renderRoute();

    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(getItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(state.attemptQuery).not.toHaveBeenCalledWith(expect.objectContaining({ skip: false }));

    state.authLoading = false;
    view.rerender(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <CrdCalloutDialogFromUrl onClose={vi.fn()} />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(getItem).toHaveBeenCalledTimes(1);
    expect(removeItem).toHaveBeenCalledTimes(1);
  });

  it('does not reveal or restore an invalid or non-owned attempt', async () => {
    state.attemptError = {};
    storeContext('framing');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(returnStorageKey('attempt-1'))).toBeNull();
  });

  it('does not replay a consumed callback on refresh or back/forward history', async () => {
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');
    const first = renderRoute();
    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    first.unmount();

    renderRoute();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(globalThis.location.search).toBe('');
  });

  it('keeps ordinary callout navigation unchanged and restores only through normal non-board paths', async () => {
    renderRoute();
    expect(screen.getByTestId('callout-dialog')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    storeContext('framing');
    await act(async () => {
      globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');
      globalThis.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(await screen.findByTestId('framing-memo-editor')).toBeInTheDocument();
  });

  it('rejects restore intent for a confirmed board while still showing the attempt-centric result', async () => {
    state.taskBoardEnabled = true;
    state.boardResult = true;
    storeContext('framing');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.getByTestId('task-board')).toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
  });

  it('waits for board detection to settle before opening a context-free result', async () => {
    state.taskBoardEnabled = true;
    state.boardResult = true;
    state.boardResolutionPending = true;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    const view = renderRoute();
    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(screen.queryByRole('dialog', { name: 'memo.signing.savedTitle' })).not.toBeInTheDocument();

    state.boardResolutionPending = false;
    view.rerender(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <CrdCalloutDialogFromUrl onClose={vi.fn()} />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    expect(await screen.findByTestId('task-board')).toBeInTheDocument();
    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
  });

  it('restores through the normal detail dialog when a board candidate resolves isBoard false', async () => {
    state.taskBoardEnabled = true;
    state.boardResult = false;
    storeContext('framing');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(await screen.findByTestId('framing-memo-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('task-board')).not.toBeInTheDocument();
  });

  it.each([
    SigningAttemptStatus.Pending,
    SigningAttemptStatus.Cancelled,
    SigningAttemptStatus.Failed,
    SigningAttemptStatus.Expired,
  ])('maps the %s attempt status into the return dialog', async status => {
    state.attemptStatus = status;
    state.attemptHasDocument = false;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByText(`memo.signing.stage.${status.toLowerCase()}`)).toBeInTheDocument();
  });

  it('shows checking while the authorized attempt query is pending', async () => {
    state.attemptLoading = true;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByText('memo.signing.stage.checking')).toBeInTheDocument();
  });

  it.each([
    ['network failure', { networkError: new Error('offline') }, true],
    ['signed response without its document', undefined, false],
  ] as const)('maps %s to a non-specific return error', async (_name, error, hasDocument) => {
    state.attemptError = error;
    state.attemptHasDocument = hasDocument;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByText('memo.signing.stage.return-error')).toBeInTheDocument();
  });

  it('ignores a stale attempt payload after a newer callback token was captured', async () => {
    state.attemptResponseId = 'attempt-stale';
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-current');

    renderRoute();

    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
  });

  it('cancels a pending result when navigation advances to a different route generation', async () => {
    state.attemptLoading = true;
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');
    const view = renderRoute();
    expect(await screen.findByText('memo.signing.stage.checking')).toBeInTheDocument();

    await act(async () => {
      globalThis.history.pushState(null, '', '/space/collaboration/callout-2');
      globalThis.dispatchEvent(new PopStateEvent('popstate'));
    });
    state.attemptLoading = false;
    view.rerender(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <CrdCalloutDialogFromUrl onClose={vi.fn()} />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
  });

  it('lets a newer callback token supersede a still-pending captured token', async () => {
    state.attemptLoading = true;
    storeContext('framing', 'attempt-2');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');
    const view = renderRoute();
    expect(await screen.findByText('memo.signing.stage.checking')).toBeInTheDocument();

    await act(async () => {
      globalThis.history.pushState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-2');
      globalThis.dispatchEvent(new PopStateEvent('popstate'));
    });
    state.attemptLoading = false;
    view.rerender(
      <BrowserRouter>
        <CrdLayoutWrapper>
          <CrdCalloutDialogFromUrl onClose={vi.fn()} />
        </CrdLayoutWrapper>
      </BrowserRouter>
    );

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(await screen.findByTestId('framing-memo-editor')).toBeInTheDocument();
    expect(state.attemptQuery).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { attemptID: 'attempt-2' }, skip: false })
    );
  });

  it.each([
    ['expired', () => storeContext('framing', 'attempt-1', { expiresAt: Date.now() - 1 })],
    ['unmatched attempt', () => storeContext('framing', 'attempt-1', { attemptId: 'another-attempt' })],
    ['foreign user', () => storeContext('framing', 'attempt-1', { userId: 'user-2' })],
    ['malformed', () => window.sessionStorage.setItem(returnStorageKey('attempt-1'), '{not-valid-json')],
  ] as const)('deletes %s return context without restoring an editor', async (_name, arrange) => {
    arrange();
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(returnStorageKey('attempt-1'))).toBeNull();
  });

  it('falls back to an attempt-centric result when session storage is unavailable', async () => {
    const storagePrototype = Object.getPrototypeOf(window.sessionStorage) as Storage;
    const getItem = vi.spyOn(storagePrototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
    getItem.mockRestore();
  });

  it('does not restore context for a different loaded callout', async () => {
    storeContext('framing', 'attempt-1', { calloutId: 'callout-other' });
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    expect(await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' })).toBeInTheDocument();
    expect(screen.queryByTestId('framing-memo-editor')).not.toBeInTheDocument();
  });

  it('keeps one result owner when the originating editor is already open', async () => {
    const user = userEvent.setup();
    state.editorAlreadyOpen = true;
    storeContext('framing');
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');

    renderRoute();

    const resultDialog = await screen.findByRole('dialog', { name: 'memo.signing.savedTitle' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getAllByTestId('framing-memo-editor')).toHaveLength(1);
    expect(resultDialog).toContainElement(document.activeElement as HTMLElement);

    await user.click(
      screen.getAllByRole('button', { name: 'memo.close' }).find(button => button.textContent) as HTMLElement
    );
    expect(screen.getByRole('dialog', { name: 'Restored framing memo editor' })).toBeInTheDocument();
    expect(screen.getAllByTestId('framing-memo-editor')).toHaveLength(1);
  });
});

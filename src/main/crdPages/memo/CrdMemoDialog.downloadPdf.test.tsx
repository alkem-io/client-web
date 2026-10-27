import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationPrivilege, type LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import type { MemoSigningDialogProps } from '@/crd/components/memo/MemoSigningDialog';
import { CrdMemoDialog } from './CrdMemoDialog';

const mocks = vi.hoisted(() => ({
  assign: vi.fn(),
  authenticated: true,
  authenticationMethodsOptions: vi.fn(),
  authenticationMethodsResult: {
    data: { me: { user: { authentication: { methods: [] as string[] } } } },
    error: undefined,
    loading: false,
  } as Record<string, unknown>,
  continueMutation: vi.fn(),
  currentUserLoading: false,
  currentUserModel: { id: 'user-1' } as { id: string } | undefined,
  download: vi.fn(),
  downloadHookArgs: vi.fn(),
  downloading: false,
  lastHistoryDialogProps: undefined as
    | { open: boolean; memoId: string; onOpenChange: (open: boolean) => void }
    | undefined,
  lastSigningDialogProps: undefined as MemoSigningDialogProps | undefined,
  memo: undefined as Record<string, unknown> | undefined,
  prepareMutation: vi.fn(),
  provider: undefined as Record<string, unknown> | undefined,
  refreshMemo: vi.fn(),
  returnAttempt: { loading: false, error: undefined, data: undefined } as Record<string, unknown>,
  returnAttemptQuery: vi.fn(),
  smallScreen: false,
  spaceEntitlements: [] as LicenseEntitlementType[],
  verificationQuery: vi.fn(),
  verificationQueryOptions: vi.fn(),
  verificationResult: { data: undefined, error: undefined, loading: false, variables: undefined } as Record<
    string,
    unknown
  >,
}));

vi.mock('@apollo/client', () => ({
  useApolloClient: () => ({ cache: { identify: vi.fn(), modify: vi.fn() } }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useContinueMemoSigningMutation: () => [mocks.continueMutation],
  useMemoSigningAttemptQuery: (options: unknown) => {
    mocks.returnAttemptQuery(options);
    return mocks.returnAttempt;
  },
  usePrepareMemoSigningMutation: () => [mocks.prepareMutation],
  useUserSecurityAuthenticationMethodsQuery: (options: unknown) => {
    mocks.authenticationMethodsOptions(options);
    return mocks.authenticationMethodsResult;
  },
  useVerifyMemoSignatureLazyQuery: (options: unknown) => {
    mocks.verificationQueryOptions(options);
    return [mocks.verificationQuery, mocks.verificationResult];
  },
  useUpdateMemoDisplayNameMutation: () => [vi.fn(), { loading: false }],
}));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: mocks.authenticated }),
}));
vi.mock('@/core/ui/fullscreen/FullscreenEditorContext', () => ({ useRegisterFullscreenEditor: () => {} }));
vi.mock('@/core/ui/fullscreen/useFullscreen', () => ({ useFullscreen: () => ({ fullscreen: false }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => mocks.smallScreen }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ loading: mocks.currentUserLoading, userModel: mocks.currentUserModel }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    entitlements: mocks.spaceEntitlements,
    space: { about: { membership: {} } },
  }),
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { about: { membership: {} } } }),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ spaceLevel: 'L0' }) }));
vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ iframeAllowedUrls: [], onError: vi.fn(), onImageUpload: vi.fn() }),
}));
vi.mock('@/domain/collaboration/memo/MemoManager/useMemoManager', () => ({
  default: () => ({ memo: mocks.memo, loading: false, refreshMemo: mocks.refreshMemo }),
}));
vi.mock('./useCrdMemoProvider', () => ({ useCrdMemoProvider: () => mocks.provider }));
vi.mock('./memoFooterMapper', () => ({
  mapMemoFooterProps: () => ({ connectionStatus: 'connected', saveStatus: 'saved' }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/crd/components/memo/MemoEditorShell', () => ({
  MemoEditorShell: ({ children, headerActions }: { children: ReactNode; headerActions: ReactNode }) => (
    <div>
      {headerActions}
      {children}
    </div>
  ),
}));
vi.mock('@/crd/components/memo/MemoSigningDialog', () => ({
  MemoSigningDialog: (props: Extract<MemoSigningDialogProps, { mode: 'signing' }>) => {
    mocks.lastSigningDialogProps = props;
    return props.open ? (
      <div data-testid="signing-dialog" data-stage={props.stage}>
        <button type="button" onClick={props.onContinue}>
          continue signing
        </button>
        <button type="button" onClick={props.onClose}>
          close signing
        </button>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          dismiss signing
        </button>
      </div>
    ) : null;
  },
}));
vi.mock('./MemoSignedCopiesDialogConnector', () => ({
  MemoSignedCopiesDialogConnector: (props: {
    open: boolean;
    memoId: string;
    onOpenChange: (open: boolean) => void;
  }) => {
    mocks.lastHistoryDialogProps = props;
    return props.open ? (
      <div data-testid="history-dialog" data-memo-id={props.memoId}>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          close history
        </button>
      </div>
    ) : null;
  },
}));
vi.mock('@/crd/components/common/CrdFullscreenButton', () => ({ CrdFullscreenButton: () => null }));
vi.mock('@/crd/components/common/Loading', () => ({ Loading: ({ text }: { text: string }) => <div>{text}</div> }));
vi.mock('@/crd/components/common/ShareButton', () => ({
  ShareButton: ({ children }: { children?: ReactNode }) => <div data-testid="share-button">{children}</div>,
}));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('@/crd/components/memo/MemoCollabFooter', () => ({ MemoCollabFooter: () => null }));
vi.mock('@/crd/components/memo/MemoDisplayName', () => ({ MemoDisplayName: () => null }));
vi.mock('@/crd/forms/markdown/CollaborativeMarkdownEditor', () => ({ CollaborativeMarkdownEditor: () => null }));
vi.mock('@/main/crdPages/whiteboard/CrdCollaborationSettings', () => ({ CrdCollaborationSettings: () => null }));

vi.mock('./useMemoPdfDownload', () => ({
  useMemoPdfDownload: (...args: unknown[]) => {
    mocks.downloadHookArgs(...args);
    return { download: mocks.download, downloading: mocks.downloading };
  },
}));

const readerMemo = () => ({
  id: 'memo-1',
  authorization: { myPrivileges: [AuthorizationPrivilege.Read] },
  contentUpdatePolicy: 'CONTRIBUTORS',
  createdBy: undefined,
  profile: { displayName: 'Board decision', storageBucket: { id: 'bucket-1' }, url: '/memo-1' },
  signatures: [],
});

const renderDialog = () => render(<CrdMemoDialog open={true} memoId="memo-1" onClose={vi.fn()} />);
const downloadButton = () => screen.queryByRole('button', { name: 'memo.downloadPdf.button' });

describe('CrdMemoDialog Download PDF action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticated = true;
    mocks.downloading = false;
    mocks.smallScreen = false;
    mocks.spaceEntitlements = [];
    mocks.memo = readerMemo();
    mocks.provider = {
      connectedUsers: [],
      connectionStatus: 'connected',
      isReadOnly: true,
      lastSaveError: undefined,
      lifecycle: { kind: 'active', access: 'read', save: 'saved' },
      memberCount: 1,
      provider: { hasLocalEdits: false, hasUnsavedChanges: false, requestDurability: vi.fn() },
      synced: true,
      user: { name: 'Alice', color: '#123456' },
      ydoc: {},
    };
  });

  it('shows the action to an authenticated reader, before Share, without any signing entitlement', () => {
    renderDialog();

    const button = downloadButton();
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryByRole('button', { name: 'memo.signing.title' })).not.toBeInTheDocument();
    const share = screen.getByTestId('share-button');
    expect(button?.compareDocumentPosition(share) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('hides the action from an anonymous viewer', () => {
    mocks.authenticated = false;

    renderDialog();

    expect(downloadButton()).not.toBeInTheDocument();
  });

  it('hides the action until the memo is loaded', () => {
    mocks.memo = undefined;

    renderDialog();

    expect(downloadButton()).not.toBeInTheDocument();
  });

  it('is disabled and busy while a download is in flight', () => {
    mocks.downloading = true;

    renderDialog();

    expect(downloadButton()).toBeDisabled();
    expect(downloadButton()).toHaveAttribute('aria-busy', 'true');
  });

  it('starts one download per click', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(downloadButton() as HTMLElement);

    expect(mocks.download).toHaveBeenCalledOnce();
  });

  it('flushes the memo provider before downloading', async () => {
    renderDialog();

    const requestDurability = mocks.downloadHookArgs.mock.lastCall?.[1] as (() => Promise<void>) | undefined;
    await requestDurability?.();

    expect(requestDurability).toBeDefined();
    expect((mocks.provider?.provider as { requestDurability: () => void }).requestDurability).toHaveBeenCalledOnce();
  });

  it('is present on small screens', () => {
    mocks.smallScreen = true;

    renderDialog();

    expect(downloadButton()).toBeInTheDocument();
  });
});

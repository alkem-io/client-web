import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AuthenticationType,
  AuthorizationPrivilege,
  LicenseEntitlementType,
  SigningAttemptStatus,
} from '@/core/apollo/generated/graphql-schema';
import type { MemoSigningDialogProps } from '@/crd/components/memo/MemoSigningDialog';
import { CrdMemoDialog } from './CrdMemoDialog';

const mocks = vi.hoisted(() => ({
  assign: vi.fn(),
  authenticated: true,
  authenticationMethodsOptions: vi.fn(),
  authenticationMethodsResult: {
    data: {
      me: {
        user: {
          authentication: { methods: ['CLEVERBASE'] },
        },
      },
    },
    error: undefined,
    loading: false,
  } as Record<string, unknown>,
  continueMutation: vi.fn(),
  lastSigningDialogProps: undefined as MemoSigningDialogProps | undefined,
  memo: undefined as Record<string, unknown> | undefined,
  prepareMutation: vi.fn(),
  provider: undefined as Record<string, unknown> | undefined,
  replaceState: vi.fn(),
  refreshMemo: vi.fn(),
  requestDurability: vi.fn(),
  returnAttempt: { loading: false, error: undefined, data: undefined } as Record<string, unknown>,
  returnAttemptQuery: vi.fn(),
  spaceEntitlements: ['SPACE_FLAG_MEMO_SIGNING'] as LicenseEntitlementType[],
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
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
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
  MemoSigningDialog: (props: MemoSigningDialogProps) => {
    mocks.lastSigningDialogProps = props;
    return props.open ? (
      <div data-testid="signing-dialog" data-stage={props.stage} data-signatures={props.signatures.length}>
        <button type="button" onClick={props.onContinue}>
          continue signing
        </button>
        <button type="button" onClick={props.onClose}>
          close signing
        </button>
        <button type="button" onClick={() => props.onOpenChange(false)}>
          dismiss signing
        </button>
        <button type="button" onClick={() => props.onVerify('signed-1')}>
          verify signed copy
        </button>
      </div>
    ) : null;
  },
}));
vi.mock('@/crd/components/common/CrdFullscreenButton', () => ({ CrdFullscreenButton: () => null }));
vi.mock('@/crd/components/common/Loading', () => ({ Loading: ({ text }: { text: string }) => <div>{text}</div> }));
vi.mock('@/crd/components/common/ShareButton', () => ({
  ShareButton: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('@/crd/components/memo/MemoCollabFooter', () => ({ MemoCollabFooter: () => null }));
vi.mock('@/crd/components/memo/MemoDisplayName', () => ({ MemoDisplayName: () => null }));
vi.mock('@/crd/forms/markdown/CollaborativeMarkdownEditor', () => ({ CollaborativeMarkdownEditor: () => null }));
vi.mock('@/main/crdPages/whiteboard/CrdCollaborationSettings', () => ({ CrdCollaborationSettings: () => null }));

const memoWith = (privileges: AuthorizationPrivilege[], signatures: Record<string, unknown>[] = []) => ({
  authorization: { myPrivileges: privileges },
  contentUpdatePolicy: 'CONTRIBUTORS',
  createdBy: undefined,
  profile: { displayName: 'Signing memo', storageBucket: { id: 'bucket-1' }, url: '/memo-1' },
  signatures,
});

const renderDialog = () => render(<CrdMemoDialog open={true} memoId="memo-1" onClose={vi.fn()} />);

describe('CrdMemoDialog signing connector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { assign: mocks.assign, hash: '', pathname: '/memo-1', search: '' });
    mocks.replaceState.mockImplementation((_state, _title, url: string) => {
      (globalThis.location as unknown as { search: string }).search = new URL(url, 'https://alkem.io').search;
    });
    vi.stubGlobal('history', { replaceState: mocks.replaceState, state: null });
    mocks.memo = memoWith([AuthorizationPrivilege.Contribute]);
    mocks.authenticated = true;
    mocks.authenticationMethodsResult = {
      data: {
        me: {
          user: {
            authentication: { methods: [AuthenticationType.Cleverbase] },
          },
        },
      },
      error: undefined,
      loading: false,
    };
    mocks.spaceEntitlements = [LicenseEntitlementType.SpaceFlagMemoSigning];
    const collaborationProvider = {
      hasLocalEdits: false,
      hasUnsavedChanges: false,
      requestDurability: mocks.requestDurability,
    };
    mocks.requestDurability.mockResolvedValue(undefined);
    mocks.prepareMutation.mockResolvedValue({
      data: {
        prepareMemoSigning: {
          attemptId: 'attempt-1',
          previewUrl: '/api/public/rest/content-signing/attempt-1/snapshot',
        },
      },
    });
    mocks.continueMutation.mockResolvedValue({
      data: { continueMemoSigning: { authorizeUrl: 'https://cleverbase.example/authorize' } },
    });
    mocks.returnAttempt = { loading: false, error: undefined, data: undefined };
    mocks.verificationResult = { data: undefined, error: undefined, loading: false, variables: undefined };
    mocks.provider = {
      connectedUsers: [],
      connectionStatus: 'connected',
      isReadOnly: false,
      lastSaveError: undefined,
      lifecycle: { kind: 'active', access: 'write', save: 'saved' },
      memberCount: 1,
      provider: collaborationProvider,
      synced: true,
      user: { name: 'Alice', color: '#123456' },
      ydoc: {},
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists the memo, prepares one exact copy, then performs a full Cleverbase navigation', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'memo.signing.title' }));

    await waitFor(() => expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'preview'));
    expect(mocks.requestDurability).toHaveBeenCalledOnce();
    expect(mocks.prepareMutation).toHaveBeenCalledWith({ variables: { memoID: 'memo-1' } });

    await user.click(screen.getByRole('button', { name: 'continue signing' }));

    await waitFor(() => expect(mocks.continueMutation).toHaveBeenCalledWith({ variables: { attemptID: 'attempt-1' } }));
    expect(mocks.assign).toHaveBeenCalledWith('https://cleverbase.example/authorize');
  });

  it('renders history and new-signature actions independently for an eligible signer', async () => {
    const user = userEvent.setup();
    mocks.memo = memoWith(
      [AuthorizationPrivilege.Contribute],
      [
        {
          id: 'signed-1',
          status: SigningAttemptStatus.Signed,
          document: { id: 'document-1', url: '/api/private/document-1' },
          updatedDate: new Date(),
        },
      ]
    );

    renderDialog();

    expect(screen.getByRole('button', { name: 'memo.signing.title' })).toBeInTheDocument();
    const history = screen.getByRole('button', { name: 'memo.signing.signedCopiesCount' });
    await user.click(history);

    expect(mocks.requestDurability).not.toHaveBeenCalled();
    expect(mocks.prepareMutation).not.toHaveBeenCalled();
    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'idle');
  });

  it('disables duplicate preparation while durability is unresolved', async () => {
    const user = userEvent.setup();
    let releaseDurability!: () => void;
    mocks.requestDurability.mockImplementation(() => new Promise<void>(resolve => (releaseDurability = resolve)));
    renderDialog();

    const sign = screen.getByRole('button', { name: 'memo.signing.title' });
    await user.click(sign);

    expect(sign).toBeDisabled();
    await user.click(sign);
    expect(mocks.requestDurability).toHaveBeenCalledOnce();
    expect(mocks.prepareMutation).not.toHaveBeenCalled();

    releaseDurability();
    await waitFor(() => expect(mocks.prepareMutation).toHaveBeenCalledOnce());
    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'preview');
  });

  it('opens signed copies for a READ-only actor without preparing another copy', async () => {
    const user = userEvent.setup();
    mocks.memo = memoWith(
      [AuthorizationPrivilege.Read],
      [{ id: 'signed-1', status: SigningAttemptStatus.Signed, updatedDate: new Date() }]
    );
    mocks.spaceEntitlements = [];
    mocks.authenticationMethodsResult = {
      data: undefined,
      error: undefined,
      loading: false,
    };

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'memo.signing.signedCopies' }));

    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'idle');
    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-signatures', '1');
    expect(mocks.requestDurability).not.toHaveBeenCalled();
    expect(mocks.prepareMutation).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'close signing' }));
    expect(screen.queryByTestId('signing-dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['the space entitlement', [], [AuthenticationType.Cleverbase]],
    ['a linked Cleverbase identity', [LicenseEntitlementType.SpaceFlagMemoSigning], [AuthenticationType.Email]],
  ] as const)('opens existing signed copies for a contributor without %s and never prepares', async (_gate, entitlements, methods) => {
    const user = userEvent.setup();
    mocks.memo = memoWith(
      [AuthorizationPrivilege.Contribute],
      [
        {
          id: 'signed-1',
          status: SigningAttemptStatus.Signed,
          updatedDate: new Date(),
        },
      ]
    );
    mocks.spaceEntitlements = [...entitlements];
    mocks.authenticationMethodsResult = {
      data: { me: { user: { authentication: { methods: [...methods] } } } },
      error: undefined,
      loading: false,
    };

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'memo.signing.signedCopies' }));

    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-signatures', '1');
    expect(mocks.prepareMutation).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'CONTRIBUTE',
      privileges: [AuthorizationPrivilege.Read],
    },
    { name: 'the space entitlement', entitlements: [] },
    {
      name: 'a linked Cleverbase identity',
      authenticationMethods: [AuthenticationType.Email],
    },
    { name: 'loaded authentication methods', loading: true },
    { name: 'available authentication methods', error: new Error('offline') },
  ])('hides Sign without $name', gate => {
    mocks.memo = memoWith(gate.privileges ?? [AuthorizationPrivilege.Contribute]);
    mocks.spaceEntitlements = gate.entitlements ?? [LicenseEntitlementType.SpaceFlagMemoSigning];
    mocks.authenticationMethodsResult = {
      data: {
        me: {
          user: {
            authentication: {
              methods: gate.authenticationMethods ?? [AuthenticationType.Cleverbase],
            },
          },
        },
      },
      error: gate.error,
      loading: gate.loading ?? false,
    };

    renderDialog();

    expect(screen.queryByRole('button', { name: 'memo.signing.title' })).not.toBeInTheDocument();
  });

  it('skips authentication methods and hides Sign for an unauthenticated actor', () => {
    mocks.authenticated = false;

    renderDialog();

    expect(mocks.authenticationMethodsOptions).toHaveBeenCalledWith({
      skip: true,
    });
    expect(screen.queryByRole('button', { name: 'memo.signing.title' })).not.toBeInTheDocument();
  });

  it('runs one uncached verification only after the signed-copy action', async () => {
    const user = userEvent.setup();
    mocks.memo = memoWith(
      [AuthorizationPrivilege.Read],
      [{ id: 'signed-1', status: SigningAttemptStatus.Signed, updatedDate: new Date() }]
    );
    mocks.verificationQuery.mockResolvedValue({
      data: { verifyMemoSignature: 'VERIFIED' },
    });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'memo.signing.signedCopies' }));
    expect(mocks.verificationQuery).not.toHaveBeenCalled();
    expect(mocks.verificationQueryOptions).toHaveBeenCalledWith({
      fetchPolicy: 'no-cache',
    });

    await user.click(screen.getByRole('button', { name: 'verify signed copy' }));
    expect(mocks.verificationQuery).toHaveBeenCalledOnce();
    expect(mocks.verificationQuery).toHaveBeenCalledWith({
      variables: { attemptID: 'signed-1' },
    });
  });

  it.each([
    { result: { loading: true }, expected: 'checking' },
    {
      result: { data: { verifyMemoSignature: 'VERIFIED' } },
      expected: 'verified',
    },
    {
      result: { data: { verifyMemoSignature: 'INVALID' } },
      expected: 'invalid',
    },
    {
      result: { data: { verifyMemoSignature: 'UNAVAILABLE' } },
      expected: 'unavailable',
    },
    {
      result: { error: new Error('gateway unavailable') },
      expected: 'unavailable',
    },
  ])('maps a requested verification result to $expected', ({ result, expected }) => {
    mocks.memo = memoWith(
      [AuthorizationPrivilege.Read],
      [{ id: 'signed-1', status: SigningAttemptStatus.Signed, updatedDate: new Date() }]
    );
    mocks.verificationResult = {
      data: undefined,
      error: undefined,
      loading: false,
      variables: { attemptID: 'signed-1' },
      ...result,
    };

    renderDialog();

    expect(mocks.lastSigningDialogProps?.signatures[0].verification).toBe(expected);
  });

  it('fails preparation when GraphQL returns no prepared attempt', async () => {
    const user = userEvent.setup();
    mocks.prepareMutation.mockResolvedValue({ data: undefined });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'memo.signing.title' }));

    await waitFor(() => expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'prepare-error'));
  });

  it('fails continuation when GraphQL returns no authorization URL', async () => {
    const user = userEvent.setup();
    mocks.continueMutation.mockResolvedValue({ data: undefined });

    renderDialog();
    await user.click(screen.getByRole('button', { name: 'memo.signing.title' }));
    await waitFor(() => expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'preview'));
    await user.click(screen.getByRole('button', { name: 'continue signing' }));

    await waitFor(() => expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'continue-error'));
  });

  it('disables preparation until the collaboration provider exists', () => {
    mocks.provider = { ...mocks.provider, provider: undefined };

    renderDialog();

    expect(screen.getByRole('button', { name: 'memo.signing.title' })).toBeDisabled();
  });

  it.each([
    [{ loading: true, error: undefined, data: undefined }, 'checking'],
    [{ loading: false, error: new Error('network'), data: undefined }, 'return-error'],
    [{ loading: false, error: undefined, data: undefined }, 'return-error'],
    [
      {
        loading: false,
        error: undefined,
        data: { signingAttempt: { status: SigningAttemptStatus.Signed } },
      },
      'signed',
    ],
  ])('loads the bookmarked signing outcome as %s -> %s', (returnAttempt, stage) => {
    vi.stubGlobal('location', {
      assign: mocks.assign,
      hash: '',
      pathname: '/memo-1',
      search: '?signingAttemptId=attempt-1',
    });
    mocks.returnAttempt = returnAttempt;

    renderDialog();

    expect(mocks.returnAttemptQuery).toHaveBeenCalledWith({
      variables: { attemptID: 'attempt-1' },
      skip: false,
      fetchPolicy: 'network-only',
    });
    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', stage);
  });

  it('refreshes MemoDetails once and binds success to the returned saved document', async () => {
    vi.stubGlobal('location', {
      assign: mocks.assign,
      hash: '',
      pathname: '/memo-1',
      search: '?signingAttemptId=returned-attempt',
    });
    mocks.returnAttempt = {
      loading: false,
      error: undefined,
      data: {
        signingAttempt: {
          id: 'returned-attempt',
          status: SigningAttemptStatus.Signed,
          document: {
            id: 'returned-document',
            url: '/api/private/returned-document',
            displayName: 'Signed decision.pdf',
          },
          actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
          updatedDate: '2026-09-10T09:00:00.000Z',
        },
      },
    };
    mocks.memo = memoWith(
      [AuthorizationPrivilege.Contribute],
      [
        {
          id: 'newer-unrelated-attempt',
          document: { id: 'newer-document', url: '/api/private/newer-document' },
          updatedDate: '2026-09-10T10:00:00.000Z',
        },
      ]
    );

    renderDialog();

    await waitFor(() => expect(mocks.refreshMemo).toHaveBeenCalledOnce());
    expect(
      (mocks.lastSigningDialogProps as unknown as { completedSignature?: { id: string } }).completedSignature?.id
    ).toBe('returned-attempt');
  });

  it('owns dialog dismissal and returned-attempt cleanup in the integration layer', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('location', {
      assign: mocks.assign,
      hash: '#section',
      pathname: '/memo-1',
      search: '?keep=1&signingAttemptId=attempt-1',
    });
    mocks.returnAttempt = {
      loading: false,
      error: undefined,
      data: { signingAttempt: { status: SigningAttemptStatus.Signed } },
    };
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'dismiss signing' }));

    expect(mocks.replaceState).toHaveBeenCalledWith(null, '', '/memo-1?keep=1#section');
    expect(screen.queryByTestId('signing-dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['?signingAttemptId=attempt-1', '', '/memo-1'],
    ['?keep=1&signingAttemptId=attempt-1', '#section', '/memo-1?keep=1#section'],
  ])('consumes a terminal return before preparing a fresh signing preview from %s', async (search, hash, expectedUrl) => {
    const user = userEvent.setup();
    vi.stubGlobal('location', {
      assign: mocks.assign,
      hash,
      pathname: '/memo-1',
      search,
    });
    mocks.returnAttempt = {
      loading: false,
      error: undefined,
      data: { signingAttempt: { status: SigningAttemptStatus.Signed } },
    };
    renderDialog();

    expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'signed');
    await user.click(screen.getByRole('button', { name: 'close signing' }));
    await user.click(screen.getByRole('button', { name: 'memo.signing.title' }));

    await waitFor(() => expect(screen.getByTestId('signing-dialog')).toHaveAttribute('data-stage', 'preview'));
    expect(mocks.replaceState).toHaveBeenCalledWith(null, '', expectedUrl);
    expect(mocks.prepareMutation).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'continue signing' }));
    expect(mocks.continueMutation).toHaveBeenCalledOnce();
  });
});

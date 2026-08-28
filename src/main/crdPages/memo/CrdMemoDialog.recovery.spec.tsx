import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  editorMounts: 0,
  editorUnmounts: 0,
  notify: vi.fn(),
  cacheModify: vi.fn(),
  persistPendingChanges: vi.fn(() => Promise.resolve()),
  ydoc: {},
  providerState: {
    phase: 'live' as 'live' | 'recovering' | 'terminal',
    access: 'readWrite' as 'readWrite' | 'readOnly',
    connectionStatus: 'connected' as 'connected' | 'disconnected',
    synced: true,
    provider: {} as object,
  },
}));

vi.mock('@apollo/client', () => ({
  useApolloClient: () => ({ cache: { modify: h.cacheModify, identify: vi.fn(() => 'Memo:memo-1') } }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateMemoDisplayNameMutation: () => [vi.fn(), { loading: false }],
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: true }),
}));
vi.mock('@/core/ui/fullscreen/FullscreenEditorContext', () => ({ useRegisterFullscreenEditor: vi.fn() }));
vi.mock('@/core/ui/fullscreen/useFullscreen', () => ({ useFullscreen: () => ({ fullscreen: false }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => h.notify }));
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: { about: { membership: {} } } }),
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { about: { membership: {} } } }),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ spaceLevel: 'L0' }) }));
vi.mock('@/domain/collaboration/memo/MemoManager/useMemoManager', () => ({
  default: () => ({
    loading: false,
    memo: {
      id: 'memo-1',
      profile: { displayName: 'Memo', url: '/memo-1', storageBucket: { id: 'bucket-1' } },
      authorization: { myPrivileges: ['CONTRIBUTE'] },
      createdBy: { profile: { displayName: 'Owner', url: '/owner' } },
    },
  }),
}));
vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));
vi.mock('./memoFooterMapper', () => ({
  mapMemoFooterProps: ({ onDelete }: { onDelete?: () => void }) => ({
    connectionStatus: h.providerState.connectionStatus,
    memberCount: 1,
    readonlyReason: null,
    onDelete,
  }),
}));
vi.mock('./useCrdMemoProvider', () => ({
  useCrdMemoProvider: () => ({
    ydoc: h.ydoc,
    provider: h.providerState.provider,
    connectionStatus: h.providerState.connectionStatus,
    synced: h.providerState.synced,
    phase: h.providerState.phase,
    access: h.providerState.access,
    hasEverSynced: true,
    hasUnconfirmedLocalChanges: true,
    isReadOnly: h.providerState.access === 'readOnly',
    readOnlyCode: undefined,
    sessionEndCode: undefined,
    resumeEditing: vi.fn(),
    retryNow: vi.fn(),
    persistPendingChanges: h.persistPendingChanges,
    memberCount: 1,
    connectedUsers: [],
    user: { id: 'u1', name: 'Tester', color: '#000' },
  }),
}));
vi.mock('@/crd/forms/markdown/CollaborativeMarkdownEditor', () => ({
  CollaborativeMarkdownEditor: ({
    disabled,
    onReady,
  }: {
    disabled: boolean;
    onReady: (editor: { getHTML: () => string; getText: () => string }) => void;
  }) => {
    useEffect(() => {
      h.editorMounts += 1;
      onReady({ getHTML: () => '<p>memo</p>', getText: () => 'memo' });
      return () => {
        h.editorUnmounts += 1;
      };
    }, []);
    return <div data-testid="memo-collaborative-editor" data-disabled={String(disabled)} />;
  },
}));
vi.mock('@/crd/components/memo/MemoEditorShell', () => ({
  MemoEditorShell: ({ children, footer, onClose }: { children: ReactNode; footer: ReactNode; onClose: () => void }) => (
    <div>
      <button type="button" onClick={onClose}>
        close memo
      </button>
      {children}
      {footer}
    </div>
  ),
}));
vi.mock('@/crd/components/memo/MemoCollabFooter', () => ({
  MemoCollabFooter: ({ onDelete }: { onDelete?: () => void }) =>
    onDelete ? (
      <button type="button" onClick={onDelete}>
        delete memo
      </button>
    ) : null,
}));
vi.mock('@/crd/components/memo/MemoDisplayName', () => ({ MemoDisplayName: () => <div /> }));
vi.mock('@/crd/components/common/CrdFullscreenButton', () => ({ CrdFullscreenButton: () => null }));
vi.mock('@/crd/components/common/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({
  ConfirmationDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        confirm delete
      </button>
    ) : null,
}));
vi.mock('@/main/crdPages/whiteboard/CrdCollaborationSettings', () => ({ CrdCollaborationSettings: () => null }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/crd/forms/markdown/markdownConverter', () => ({ htmlToMarkdown: vi.fn(async () => 'memo') }));

import { CrdMemoDialog } from './CrdMemoDialog';

describe('CrdMemoDialog collaboration recovery', () => {
  beforeEach(() => {
    h.editorMounts = 0;
    h.editorUnmounts = 0;
    h.providerState.phase = 'live';
    h.providerState.access = 'readWrite';
    h.providerState.connectionStatus = 'connected';
    h.providerState.synced = true;
    h.providerState.provider = {};
    h.persistPendingChanges.mockReset();
    h.persistPendingChanges.mockResolvedValue(undefined);
    h.notify.mockReset();
    h.cacheModify.mockReset();
  });

  it('keeps the established editor mounted while the provider transiently recovers', () => {
    const { rerender } = render(<CrdMemoDialog open={true} memoId="memo-1" onClose={() => {}} />);
    const establishedEditor = screen.getByTestId('memo-collaborative-editor');
    expect(h.editorMounts).toBe(1);

    h.providerState.phase = 'recovering';
    h.providerState.connectionStatus = 'disconnected';
    h.providerState.synced = false;
    rerender(<CrdMemoDialog open={true} memoId="memo-1" onClose={() => {}} />);

    expect(screen.getByTestId('memo-collaborative-editor')).toBe(establishedEditor);
    expect(h.editorMounts).toBe(1);
    expect(h.editorUnmounts).toBe(0);
  });

  it('keeps the same memo editor and Y.Doc mounted across an admission-provider replacement', () => {
    const { rerender } = render(<CrdMemoDialog open={true} memoId="memo-1" onClose={() => {}} />);
    const establishedEditor = screen.getByTestId('memo-collaborative-editor');

    h.providerState.connectionStatus = 'disconnected';
    h.providerState.phase = 'recovering';
    rerender(<CrdMemoDialog open={true} memoId="memo-1" onClose={() => {}} />);
    h.providerState.provider = {};
    h.providerState.connectionStatus = 'connected';
    h.providerState.phase = 'live';
    rerender(<CrdMemoDialog open={true} memoId="memo-1" onClose={() => {}} />);

    expect(screen.getByTestId('memo-collaborative-editor')).toBe(establishedEditor);
    expect(h.editorMounts).toBe(1);
    expect(h.editorUnmounts).toBe(0);
  });

  it('freezes, persists, and ignores repeated close gestures until persistence finishes', async () => {
    let finishPersistence!: () => void;
    h.persistPendingChanges.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finishPersistence = resolve;
        })
    );
    const onClose = vi.fn();
    render(<CrdMemoDialog open={true} memoId="memo-1" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'close memo' }));
    fireEvent.click(screen.getByRole('button', { name: 'close memo' }));

    await waitFor(() =>
      expect(screen.getByTestId('memo-collaborative-editor')).toHaveAttribute('data-disabled', 'true')
    );
    expect(h.persistPendingChanges).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();

    finishPersistence();
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(h.cacheModify).toHaveBeenCalledOnce();
  });

  it('keeps the memo mounted and editable when close persistence fails', async () => {
    h.persistPendingChanges.mockRejectedValue(new Error('persist failed'));
    const onClose = vi.fn();
    render(<CrdMemoDialog open={true} memoId="memo-1" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'close memo' }));

    await waitFor(() => expect(h.notify).toHaveBeenCalledWith('callout.memo.saveFailed', 'error'));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId('memo-collaborative-editor')).toHaveAttribute('data-disabled', 'false');
  });

  it('does not attempt normal persistence after a terminal refusal', async () => {
    h.providerState.phase = 'terminal';
    h.providerState.access = 'readOnly';
    const onClose = vi.fn();
    render(<CrdMemoDialog open={true} memoId="memo-1" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'close memo' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(h.persistPendingChanges).not.toHaveBeenCalled();
  });

  it('intentionally bypasses close persistence when the memo is deleted', async () => {
    const onClose = vi.fn();
    const onDelete = vi.fn(async () => {});
    render(<CrdMemoDialog open={true} memoId="memo-1" onClose={onClose} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'delete memo' }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm delete' }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();
    expect(h.persistPendingChanges).not.toHaveBeenCalled();
  });
});

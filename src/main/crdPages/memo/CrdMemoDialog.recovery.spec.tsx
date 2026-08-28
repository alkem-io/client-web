import { render, screen } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  editorMounts: 0,
  editorUnmounts: 0,
  providerState: {
    phase: 'live' as 'live' | 'recovering',
    connectionStatus: 'connected' as 'connected' | 'disconnected',
    synced: true,
  },
}));

vi.mock('@apollo/client', () => ({
  useApolloClient: () => ({ cache: { modify: vi.fn(), identify: vi.fn() } }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateMemoDisplayNameMutation: () => [vi.fn(), { loading: false }],
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: true }),
}));
vi.mock('@/core/ui/fullscreen/FullscreenEditorContext', () => ({ useRegisterFullscreenEditor: vi.fn() }));
vi.mock('@/core/ui/fullscreen/useFullscreen', () => ({ useFullscreen: () => ({ fullscreen: false }) }));
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
  mapMemoFooterProps: () => ({
    connectionStatus: h.providerState.connectionStatus,
    memberCount: 1,
    readonlyReason: null,
  }),
}));
vi.mock('./useCrdMemoProvider', () => ({
  useCrdMemoProvider: () => ({
    ydoc: {},
    provider: {},
    connectionStatus: h.providerState.connectionStatus,
    synced: h.providerState.synced,
    phase: h.providerState.phase,
    hasEverSynced: true,
    hasUnconfirmedLocalChanges: true,
    isReadOnly: false,
    readOnlyCode: undefined,
    sessionEndCode: undefined,
    resumeEditing: vi.fn(),
    retryNow: vi.fn(),
    memberCount: 1,
    connectedUsers: [],
    user: { id: 'u1', name: 'Tester', color: '#000' },
  }),
}));
vi.mock('@/crd/forms/markdown/CollaborativeMarkdownEditor', () => ({
  CollaborativeMarkdownEditor: () => {
    useEffect(() => {
      h.editorMounts += 1;
      return () => {
        h.editorUnmounts += 1;
      };
    }, []);
    return <div data-testid="memo-collaborative-editor" />;
  },
}));
vi.mock('@/crd/components/memo/MemoEditorShell', () => ({
  MemoEditorShell: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));
vi.mock('@/crd/components/memo/MemoCollabFooter', () => ({ MemoCollabFooter: () => <div /> }));
vi.mock('@/crd/components/memo/MemoDisplayName', () => ({ MemoDisplayName: () => <div /> }));
vi.mock('@/crd/components/common/CrdFullscreenButton', () => ({ CrdFullscreenButton: () => null }));
vi.mock('@/crd/components/common/ShareButton', () => ({ ShareButton: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('@/main/crdPages/whiteboard/CrdCollaborationSettings', () => ({ CrdCollaborationSettings: () => null }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

import { CrdMemoDialog } from './CrdMemoDialog';

describe('CrdMemoDialog collaboration recovery', () => {
  beforeEach(() => {
    h.editorMounts = 0;
    h.editorUnmounts = 0;
    h.providerState.phase = 'live';
    h.providerState.connectionStatus = 'connected';
    h.providerState.synced = true;
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
});

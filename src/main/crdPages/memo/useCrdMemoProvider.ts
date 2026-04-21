import { useEffect, useState } from 'react';
import { useCollaboration } from '@/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration';
import useUserCursor from '@/core/ui/forms/CollaborativeMarkdownInput/useUserCursor';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import { MemoStatus } from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';

type UseCrdMemoProviderProps = {
  collaborationId?: string;
};

/**
 * Thin wrapper around the MUI collab-input `useCollaboration` hook.
 *
 * Reuses the existing Hocuspocus provider lifecycle (WebSocket URL resolution,
 * provider creation, event wiring, cleanup) so there is exactly one source of
 * truth for memo/collab wiring. See `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts`.
 *
 * Adds: member count derived from provider awareness, and maps the internal
 * `MemoStatus` to the CRD-facing `CollabStatus` string union.
 */
export function useCrdMemoProvider({ collaborationId }: UseCrdMemoProviderProps) {
  const collab = useCollaboration({ collaborationId });
  const { userId, userName, cursorColor } = useUserCursor();
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const provider = collab.provider;
    if (!provider) return;

    const updateMemberCount = () => {
      setMemberCount(provider.awareness?.getStates().size ?? 0);
    };

    updateMemberCount();
    provider.awareness?.on('change', updateMemberCount);
    return () => {
      provider.awareness?.off('change', updateMemberCount);
    };
  }, [collab.provider]);

  const connectionStatus: CollabStatus = (() => {
    switch (collab.status) {
      case MemoStatus.CONNECTED:
        return 'connected';
      case MemoStatus.CONNECTING:
        return 'connecting';
      default:
        return 'disconnected';
    }
  })();

  return {
    ydoc: collab.ydoc,
    provider: collab.provider,
    connectionStatus,
    synced: collab.synced,
    isReadOnly: collab.isReadOnly ?? false,
    readOnlyCode: collab.readOnlyCode,
    memberCount,
    user: { id: userId, name: userName, color: cursorColor },
  };
}

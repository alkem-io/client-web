import { useEffect, useState } from 'react';
import { useCollaboration } from '@/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration';
import useUserCursor from '@/core/ui/forms/CollaborativeMarkdownInput/useUserCursor';
import type { ConnectedUser } from '@/crd/components/memo/MemoCollabFooter';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import { MemoStatus } from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';

type UseCrdMemoProviderProps = {
  collaborationId?: string;
};

/**
 * Awareness fires on every remote cursor move, but only the user set (id + name + color)
 * matters for the footer avatars. Skip setState when the set is unchanged.
 */
function sameUsers(a: ConnectedUser[], b: ConnectedUser[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.id !== y.id || x.name !== y.name || x.color !== y.color) return false;
  }
  return true;
}

/**
 * Thin wrapper around the MUI collab-input `useCollaboration` hook.
 *
 * Reuses the existing Hocuspocus provider lifecycle (WebSocket URL resolution,
 * provider creation, event wiring, cleanup) so there is exactly one source of
 * truth for memo/collab wiring. See `src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts`.
 *
 * Adds: member count + connected-user presence list derived from provider
 * awareness, and maps the internal `MemoStatus` to the CRD-facing
 * `CollabStatus` string union.
 */
export function useCrdMemoProvider({ collaborationId }: UseCrdMemoProviderProps) {
  const collab = useCollaboration({ collaborationId });
  const { userId, userName, cursorColor } = useUserCursor();
  const [memberCount, setMemberCount] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  useEffect(() => {
    const provider = collab.provider;
    if (!provider) return;

    const computeState = () => {
      const states = provider.awareness?.getStates();
      if (!states) return { count: 0, users: [] as ConnectedUser[] };
      const users: ConnectedUser[] = [];
      // `user` is written into awareness by Tiptap's CollaborationCaret extension
      // (see src/core/ui/forms/CollaborativeMarkdownInput/hooks/useCollaboration.ts).
      // Clients that have not yet announced a user are counted but not rendered.
      states.forEach((state, clientId) => {
        const user = (state as { user?: { id?: string; name?: string; color?: string } } | undefined)?.user;
        if (user?.name) {
          users.push({
            id: String(clientId),
            name: user.name,
            color: user.color ?? '#888888',
          });
        }
      });
      return { count: states.size, users };
    };

    const apply = () => {
      const { count, users } = computeState();
      setMemberCount(count);
      // Awareness fires on every cursor move; only allocate a new array when the
      // user set actually changes so CrdMemoDialog doesn't re-render per keystroke.
      setConnectedUsers(prev => (sameUsers(prev, users) ? prev : users));
    };

    // Initial sync is safe synchronously — we're post-commit in an effect.
    apply();

    // Awareness 'change' can fire synchronously during another component's render
    // (e.g. when `useEditor`'s lazy useState initializer constructs the editor and
    // CollaborationCaret writes its user field into awareness). Deferring via
    // queueMicrotask moves the setState out of that render's call stack so React
    // doesn't warn "setState during render of a different component".
    let scheduled = false;
    const onChange = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        apply();
      });
    };

    provider.awareness?.on('change', onChange);
    return () => {
      provider.awareness?.off('change', onChange);
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
    connectedUsers,
    user: { id: userId, name: userName, color: cursorColor },
  };
}

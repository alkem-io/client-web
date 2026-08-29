import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import type { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { MemoStatus } from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import {
  type CollaborationState,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { useCollaborationBeforeUnload } from '@/domain/collaboration/realTimeCollaboration/useCollaborationBeforeUnload';

interface UseCollaborationProps {
  collaborationId?: string;
}

/** Memo binding over the same per-document lifecycle used by whiteboards. */
export const useCollaboration = ({ collaborationId }: UseCollaborationProps) => {
  const [session, setSession] = useState<{ ydoc: Y.Doc; provider: UnifiedCollabProvider }>();
  const [lifecycle, setLifecycle] = useState<CollaborationState>({ kind: 'loading' });
  const [established, setEstablished] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date>();
  const [lastSaveError, setLastSaveError] = useState<string>();

  useEffect(() => {
    setSession(undefined);
    setLifecycle({ kind: 'loading' });
    setEstablished(false);
    setLastSaveError(undefined);
    if (!collaborationId) return;
    const ydoc = new Y.Doc();
    const provider = new UnifiedCollabProvider({
      documentId: collaborationId,
      type: 'memo',
      doc: ydoc,
      connect: false,
    });
    const unsubscribeState = provider.subscribe(state => {
      setLifecycle(state);
      if (state.kind === 'active') setEstablished(true);
    });
    const unsubscribeSaved = provider.onSaveResult(error => {
      setLastSaveError(error);
      if (!error) setLastSaveTime(new Date());
    });
    setSession({ ydoc, provider });
    provider.connect();
    return () => {
      unsubscribeState();
      unsubscribeSaved();
      provider.destroy();
      ydoc.destroy();
    };
  }, [collaborationId]);

  const { ydoc, provider } = session ?? {};

  const active = lifecycle.kind === 'active';
  const status = !active
    ? lifecycle.kind === 'loading'
      ? MemoStatus.CONNECTING
      : MemoStatus.DISCONNECTED
    : lifecycle.save === 'offline'
      ? MemoStatus.DISCONNECTED
      : MemoStatus.CONNECTED;
  const readOnlyCode: ReadOnlyCode | undefined = provider?.readOnlyReason;
  useCollaborationBeforeUnload(lifecycle, !!provider?.hasUnsavedChanges);

  return {
    status,
    synced: established,
    lastSaveTime,
    lastSaveError,
    isReadOnly: !active || lifecycle.access === 'read',
    readOnlyCode,
    lifecycle,
    ydoc,
    provider,
  };
};

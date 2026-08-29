import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import type { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { MemoStatus } from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import {
  type CollaborationState,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { useCollaborationBeforeUnload } from '@/domain/collaboration/realTimeCollaboration/useCollaborationBeforeUnload';

type UseCollaborationProps = {
  collaborationId?: string;
};

type CollaborationSession = {
  collaborationId: string;
  ydoc: Y.Doc;
  provider: UnifiedCollabProvider;
};

/** Memo binding over the same per-document lifecycle used by whiteboards. */
export const useCollaboration = ({ collaborationId }: UseCollaborationProps) => {
  const [session, setSession] = useState<CollaborationSession>();
  const [lifecycle, setLifecycle] = useState<CollaborationState>({ kind: 'loading' });
  const [established, setEstablished] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date>();
  const [lastSaveError, setLastSaveError] = useState<string>();

  useEffect(() => {
    setSession(undefined);
    setLifecycle({ kind: 'loading' });
    setEstablished(false);
    setLastSaveTime(undefined);
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
    setSession({ collaborationId, ydoc, provider });
    provider.connect();
    return () => {
      unsubscribeState();
      unsubscribeSaved();
      provider.destroy();
      ydoc.destroy();
    };
  }, [collaborationId]);

  const currentSession = session?.collaborationId === collaborationId ? session : undefined;
  const { ydoc, provider } = currentSession ?? {};
  const currentLifecycle: CollaborationState = currentSession ? lifecycle : { kind: 'loading' };
  const currentEstablished = currentSession ? established : false;
  const currentLastSaveTime = currentSession ? lastSaveTime : undefined;
  const currentLastSaveError = currentSession ? lastSaveError : undefined;

  const active = currentLifecycle.kind === 'active';
  const status = !active
    ? currentLifecycle.kind === 'loading'
      ? MemoStatus.CONNECTING
      : MemoStatus.DISCONNECTED
    : currentLifecycle.save === 'offline'
      ? MemoStatus.DISCONNECTED
      : MemoStatus.CONNECTED;
  const readOnlyCode: ReadOnlyCode | undefined = provider?.readOnlyReason;
  useCollaborationBeforeUnload(currentLifecycle, !!provider?.hasUnsavedChanges);

  return {
    status,
    synced: currentEstablished,
    lastSaveTime: currentLastSaveTime,
    lastSaveError: currentLastSaveError,
    isReadOnly: !active || currentLifecycle.access === 'read',
    readOnlyCode,
    lifecycle: currentLifecycle,
    ydoc,
    provider,
  };
};

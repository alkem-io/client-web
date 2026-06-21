import type { Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import type { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { useOnlineStatus } from '@/core/utils/useOnlineStatus';
import {
  type CollaborationStatus,
  isCollaborationStatus,
  MemoStatus,
} from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import {
  type ControlMessage,
  controlReasonToReadOnlyCode,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { useNotification } from '../../../notifications/useNotification';
import useUserCursor from '../useUserCursor';

interface UseCollaborationProps {
  collaborationId?: string;
}

/**
 * Memo real-time collaboration on the unified collaboration service
 * (`/collab/<id>?type=memo`). The same `Y.Doc` is bound by Tiptap's
 * `Collaboration` extension; presence is driven by `CollaborationCaret` off the
 * provider's y-protocols awareness. Save acknowledgements and read-only state
 * arrive on the provider's control channel (replacing the legacy Hocuspocus
 * stateless protocol).
 */
export const useCollaboration = ({ collaborationId }: UseCollaborationProps) => {
  const { userId, userName, cursorColor } = useUserCursor();
  const notify = useNotification();
  const isOnline = useOnlineStatus();

  const [status, setStatus] = useState<CollaborationStatus>(MemoStatus.CONNECTING);
  const [synced, setSynced] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>(undefined);
  const [readOnlyState, setReadOnlyState] = useState<{ readOnly: boolean; readOnlyCode?: ReadOnlyCode }>();

  const ydoc = useMemo(() => new Y.Doc(), []);

  // Stable ref for notify to avoid triggering effect cleanup on identity changes
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // Create the provider without auto-connecting; connection is started in the effect.
  const provider = useMemo(() => {
    if (!collaborationId) {
      return null;
    }

    return new UnifiedCollabProvider({
      documentId: collaborationId,
      type: 'memo',
      doc: ydoc,
      connect: false,
    });
  }, [collaborationId, ydoc]);

  // Wire up provider events and connect.
  useEffect(() => {
    if (!provider) return;

    const syncHandler = (isSynced: boolean) => {
      setSynced(isSynced);
    };

    const statusHandler = (nextStatus: string) => {
      if (isCollaborationStatus(nextStatus)) {
        setStatus(nextStatus);
      } else {
        logWarn('UnknownMemoStatusError', { category: TagCategoryValues.MEMO, label: `Status: ${nextStatus}` });
      }
    };

    const controlHandler = (message: ControlMessage) => {
      switch (message.kind) {
        case 'saved':
          setLastSaveTime(new Date());
          break;
        case 'save-error':
          notifyRef.current('Unable to save changes', 'warning');
          break;
        case 'read-only-state':
          setReadOnlyState({
            readOnly: !!message.readOnly,
            readOnlyCode: controlReasonToReadOnlyCode(message.reason),
          });
          break;
        default:
          break;
      }
    };

    provider.on('status', statusHandler);
    provider.on('synced', syncHandler);
    provider.on('control', controlHandler);

    // Start the WebSocket connection now that event listeners are in place.
    provider.connect();

    return () => {
      provider.destroy();
    };
  }, [provider]);

  useEffect(() => {
    setReadOnlyState({
      readOnly: !isOnline,
      readOnlyCode: undefined,
    });
  }, [isOnline]);

  // Extensions depend on the memoized provider, not ref.current
  const collaborationExtensions: Extensions = useMemo(() => {
    if (!provider) return [];

    return [
      Collaboration.extend().configure({
        document: ydoc,
      }),
      CollaborationCaret.extend().configure({
        provider: provider,
        user: {
          id: userId,
          name: userName,
          color: cursorColor,
        },
      }),
    ];
  }, [provider, ydoc, userName, cursorColor]);

  return {
    status,
    synced,
    lastSaveTime,
    isReadOnly: readOnlyState?.readOnly,
    readOnlyCode: readOnlyState?.readOnlyCode,
    collaborationExtensions,
    ydoc,
    provider,
  };
};

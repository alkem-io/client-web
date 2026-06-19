import type { Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { type ControlMessage, readOnlyReasonToCode } from '@/core/collab/controlMessage';
import { UnifiedCollabProvider } from '@/core/collab/UnifiedCollabProvider';
import { error as logError, warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import type { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { useOnlineStatus } from '@/core/utils/useOnlineStatus';
import {
  type CollaborationStatus,
  isCollaborationStatus,
  MemoStatus,
} from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import { env } from '@/main/env';
import { useNotification } from '../../../notifications/useNotification';
import useUserCursor from '../useUserCursor';

interface UseCollaborationProps {
  collaborationId?: string;
}

export const useCollaboration = ({ collaborationId }: UseCollaborationProps) => {
  const { userId, userName, cursorColor } = useUserCursor();
  const notify = useNotification();
  const isOnline = useOnlineStatus();

  const [status, setStatus] = useState<CollaborationStatus>(MemoStatus.CONNECTING);
  const [synced, setSynced] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>(undefined);
  const [readOnlyState, setReadOnlyState] = useState<{ readOnly: boolean; readOnlyCode?: ReadOnlyCode }>();

  const ydoc = useMemo(() => new Y.Doc(), []);

  const getCollaborationServiceUrl = (): string | null => {
    const baseUrl = env?.VITE_APP_COLLAB_DOC_URL;
    const path = env?.VITE_APP_COLLAB_DOC_PATH;

    if (!baseUrl) {
      logError('Collaboration service URL not configured', {
        category: TagCategoryValues.MEMO,
        label: `url: ${env?.VITE_APP_COLLAB_DOC_URL}; path: ${env?.VITE_APP_COLLAB_DOC_PATH}`,
      });

      return null;
    }

    // Normalize URL construction (ensure single slash between base and path)
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path?.startsWith('/') ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
  };

  // Stable ref for notify to avoid triggering effect cleanup on identity changes
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  // Create provider without auto-connecting; connection is started in useEffect
  const provider = useMemo(() => {
    const COLLAB_SERVICE_URL = getCollaborationServiceUrl();

    if (!collaborationId || !COLLAB_SERVICE_URL) {
      return null;
    }

    return new UnifiedCollabProvider({
      url: COLLAB_SERVICE_URL,
      documentId: collaborationId,
      contentType: 'memo',
      doc: ydoc,
    });
  }, [collaborationId, ydoc]);

  // Wire up provider events and connect
  useEffect(() => {
    if (!provider) return;

    const syncHandler = (state: boolean) => {
      setSynced(!!state);
    };

    const statusHandler = (event: { status: string }) => {
      if (isCollaborationStatus(event.status)) {
        setStatus(event.status);
      } else {
        logWarn('UnknownMemoStatusError', { category: TagCategoryValues.MEMO, label: `Status: ${event.status}` });
      }
    };

    // The type-3 control channel replaces Hocuspocus "stateless" messages: saved /
    // save-error → save indicator + warning; read-only-state (+optional reason) →
    // editor lock + footer reason. Unknown kinds are ignored by the decoder.
    const controlHandler = (msg: ControlMessage) => {
      switch (msg.kind) {
        case 'saved':
          setLastSaveTime(new Date());
          break;
        case 'save-error':
          notifyRef.current('Unable to save changes', 'warning');
          break;
        case 'read-only-state':
          setReadOnlyState({
            readOnly: !!msg.readOnly,
            // OPEN-1: the server-side `reason` (collab) maps back to the existing
            // ReadOnlyCode so the footer's read-only reason UX is preserved. When the
            // server omits it (OPEN-1 not yet landed), the footer falls back to its
            // generic policy reason — the capacity/multi-user granularity is lost.
            readOnlyCode: readOnlyReasonToCode(msg.reason),
          });
          break;
        default:
          // room-user-change / room-closed and forward-compat kinds: no memo UX impact today.
          break;
      }
    };

    // A handshake 401 (or any auth-rejecting close) drops sync, mirroring the old
    // Hocuspocus `authenticationFailed` behaviour.
    const connectionCloseHandler = () => {
      setSynced(false);
    };

    provider.on('status', statusHandler);
    provider.on('synced', syncHandler);
    provider.on('connection-close', connectionCloseHandler);
    provider.on('connection-error', connectionCloseHandler);
    const unsubscribeControl = provider.onControl(controlHandler);

    // Start the WebSocket connection now that event listeners are in place
    provider.connect();

    return () => {
      unsubscribeControl();
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

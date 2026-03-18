import { type onStatelessParameters, TiptapCollabProvider, TiptapCollabProviderWebsocket } from '@hocuspocus/provider';
import type { Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
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
import {
  isStatelessReadOnlyStateMessage,
  isStatelessSaveErrorMessage,
  isStatelessSaveMessage,
} from '../stateless-messaging';
import { decodeStatelessMessage } from '../stateless-messaging/util';
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
    const MEMO_SERVICE_URL = getCollaborationServiceUrl();

    if (!collaborationId || !MEMO_SERVICE_URL) {
      return null;
    }

    const websocketProvider = new TiptapCollabProviderWebsocket({
      baseUrl: MEMO_SERVICE_URL,
      connect: false,
    });

    return new TiptapCollabProvider({
      websocketProvider,
      name: collaborationId,
      document: ydoc,
    });
  }, [collaborationId, ydoc]);

  // Wire up provider events and connect
  useEffect(() => {
    if (!provider) return;

    const syncHandler = (event: { state: string }) => {
      setSynced(!!event.state);
    };

    const statusHandler = (event: { status: string }) => {
      if (isCollaborationStatus(event.status)) {
        setStatus(event.status);
      } else {
        logWarn('UnknownMemoStatusError', { category: TagCategoryValues.MEMO, label: `Status: ${event.status}` });
      }
    };

    const statelessEventHandler = ({ payload }: onStatelessParameters) => {
      const decodedMessage = decodeStatelessMessage(payload);
      if (!decodedMessage) {
        return;
      }

      if (isStatelessSaveMessage(decodedMessage)) {
        if (isStatelessSaveErrorMessage(decodedMessage)) {
          notifyRef.current('Unable to save changes', 'warning');
        } else {
          setLastSaveTime(new Date());
        }
      } else if (isStatelessReadOnlyStateMessage(decodedMessage)) {
        setReadOnlyState({
          readOnly: decodedMessage.readOnly,
          readOnlyCode: decodedMessage.readOnlyCode,
        });
      }
    };

    const authenticationFailedHandler = () => {
      setSynced(false);
    };

    provider.on('status', statusHandler);
    provider.on('synced', syncHandler);
    provider.on('authenticationFailed', authenticationFailedHandler);
    provider.on('stateless', statelessEventHandler);

    // Start the WebSocket connection now that event listeners are in place
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

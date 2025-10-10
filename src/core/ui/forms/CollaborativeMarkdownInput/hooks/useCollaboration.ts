import { useEffect, useMemo, useState } from 'react';
import { Extensions } from '@tiptap/core';
import { TiptapCollabProvider, onStatelessParameters } from '@hocuspocus/provider';
import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import {
  CollaborationStatus,
  MemoStatus,
  isCollaborationStatus,
} from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import { env } from '@/main/env';
import {
  isStatelessSaveMessage,
  isStatelessReadOnlyStateMessage,
  isStatelessSaveErrorMessage,
} from '../stateless-messaging';
import { decodeStatelessMessage } from '../stateless-messaging/util';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { useNotification } from '../../../notifications/useNotification';
import useUserCursor from '../useUserCursor';
import { useOnlineStatus } from '@/core/utils/useOnlineStatus';
import { error as logError } from '@/core/logging/sentry/log';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';

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

  // Create provider synchronously so extensions are available before editor initialization
  const provider = useMemo(() => {
    const MEMO_SERVICE_URL = getCollaborationServiceUrl();

    if (!collaborationId || !MEMO_SERVICE_URL) {
      return null;
    }

    return new TiptapCollabProvider({
      baseUrl: MEMO_SERVICE_URL,
      name: collaborationId,
      document: ydoc,
    });
  }, [collaborationId, ydoc]);

  // Wire up provider events in effect
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
          notify('Unable to save changes', 'warning');
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

    return () => {
      provider.destroy();
    };
  }, [provider, notify]);

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

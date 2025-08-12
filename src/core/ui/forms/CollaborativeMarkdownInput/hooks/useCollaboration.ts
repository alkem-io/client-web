import { useEffect, useMemo, useRef, useState } from 'react';
import { Extensions } from '@tiptap/core';
import { TiptapCollabProvider, onStatelessParameters } from '@hocuspocus/provider';
import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
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

interface UseCollaborationProps {
  collaborationId?: string;
}

export const useCollaboration = ({ collaborationId }: UseCollaborationProps) => {
  const { userName, cursorColor } = useUserCursor();
  const notify = useNotification();
  const isOnline = useOnlineStatus();

  const [status, setStatus] = useState<CollaborationStatus>(MemoStatus.CONNECTING);
  const [synced, setSynced] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>(undefined);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const providerRef = useRef<TiptapCollabProvider | null>(null);

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

  useEffect(() => {
    const MEMO_SERVICE_URL = getCollaborationServiceUrl();

    if (!collaborationId || !MEMO_SERVICE_URL) return;

    providerRef.current = new TiptapCollabProvider({
      baseUrl: MEMO_SERVICE_URL,
      name: collaborationId,
      document: ydoc,
    });

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
        setIsReadOnly(decodedMessage.readOnly);
      }
    };

    const authenticationFailedHandler = () => {
      setSynced(false);
    };

    providerRef.current.on('status', statusHandler);
    providerRef.current.on('synced', syncHandler);
    providerRef.current.on('authenticationFailed', authenticationFailedHandler);
    providerRef.current.on('stateless', statelessEventHandler);

    return () => {
      providerRef.current?.destroy();
    };
  }, [ydoc, collaborationId, notify]);

  useEffect(() => {
    setIsReadOnly(!isOnline);
  }, [isOnline]);

  const collaborationExtensions: Extensions = useMemo(() => {
    if (!providerRef.current) return [];

    return [
      Collaboration.extend().configure({
        document: ydoc,
      }),
      CollaborationCursor.extend().configure({
        provider: providerRef.current,
        user: {
          name: userName,
          color: cursorColor,
        },
      }),
    ];
  }, [providerRef.current, ydoc, userName, cursorColor]);

  return {
    status,
    synced,
    lastSaveTime,
    isReadOnly,
    collaborationExtensions,
    ydoc,
    providerRef,
  };
};

import type { Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Y from 'yjs';
import type { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { useOnlineStatus } from '@/core/utils/useOnlineStatus';
import {
  type CollaborationState,
  type ControlMessage,
  controlReasonToReadOnlyCode,
  UnifiedCollabProvider,
} from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { useNotification } from '../../../notifications/useNotification';
import useUserCursor from '../useUserCursor';

type UseCollaborationProps = { collaborationId?: string };

export const useCollaboration = ({ collaborationId }: UseCollaborationProps) => {
  const { userId, userName, cursorColor } = useUserCursor();
  const notify = useNotification();
  const { t } = useTranslation();
  const online = useOnlineStatus();
  const [state, setState] = useState<CollaborationState>({ status: 'connecting' });
  const [lastSaveTime, setLastSaveTime] = useState<Date>();
  const [readOnlyState, setReadOnlyState] = useState<{ readOnly: boolean; readOnlyCode?: ReadOnlyCode }>();
  const ydoc = useMemo(() => new Y.Doc(), [collaborationId]);
  const notifyRef = useRef(notify);
  const tRef = useRef(t);

  useEffect(() => {
    notifyRef.current = notify;
    tRef.current = t;
  }, [notify, t]);

  const provider = useMemo(
    () =>
      collaborationId
        ? new UnifiedCollabProvider({ documentId: collaborationId, type: 'memo', doc: ydoc, connect: false })
        : null,
    [collaborationId, ydoc]
  );

  useEffect(() => {
    if (!provider) return;
    setState(provider.state);
    setLastSaveTime(undefined);
    setReadOnlyState(undefined);
    const handleControl = (message: ControlMessage) => {
      switch (message.kind) {
        case 'saved':
          setLastSaveTime(new Date());
          break;
        case 'save-error':
          notifyRef.current(tRef.current('callout.memo.saveFailed'), 'warning');
          break;
        case 'read-only-state':
          setReadOnlyState({
            readOnly: !!message.readOnly,
            readOnlyCode: controlReasonToReadOnlyCode(message.reason),
          });
          break;
        case 'update-rejected':
          notifyRef.current(tRef.current('callout.memo.updateRejected'), 'warning');
          break;
        default:
          break;
      }
    };
    const handleState = (next: CollaborationState) => setState(next);
    provider.on('state', handleState);
    provider.on('control', handleControl);
    provider.connect();
    return () => provider.destroy();
  }, [provider]);

  const collaborationExtensions: Extensions = useMemo(() => {
    if (!provider) return [];
    return [
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({ provider, user: { id: userId, name: userName, color: cursorColor } }),
    ];
  }, [provider, ydoc, userId, userName, cursorColor]);

  return {
    state,
    lastSaveTime,
    isReadOnly: !online || readOnlyState?.readOnly,
    readOnlyCode: readOnlyState?.readOnlyCode,
    collaborationExtensions,
    ydoc,
    provider,
  };
};

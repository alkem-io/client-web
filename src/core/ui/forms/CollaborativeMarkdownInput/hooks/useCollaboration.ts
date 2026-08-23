import type { Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  const [status, setStatus] = useState<CollaborationStatus>(MemoStatus.CONNECTING);
  const [synced, setSynced] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>(undefined);
  const [readOnlyState, setReadOnlyState] = useState<{ readOnly: boolean; readOnlyCode?: ReadOnlyCode }>();

  // Bumped when the server REJECTS a memo update (`update-rejected`). A rejected
  // generation must be DISCARDED, not kept locally: the server refused it, so every
  // later clock-dependent edit would stack behind a struct the server never has. Bumping
  // this recreates the `Y.Doc` + provider below (the same mechanism as a room change), so
  // the editor rebinds via its `[ydoc, provider]` deps and the fresh provider resyncs the
  // server-canonical state — never reusing the refused doc. Mirrors the whiteboard's
  // discard-generation-and-resync recovery.
  const [recoveryGeneration, setRecoveryGeneration] = useState(0);

  // One Y.Doc PER collaborationId, not per component lifetime. If the memoId changes
  // in place (deep-link/route change while the dialog stays mounted), a stale
  // component-lifetime doc would be reused for the new room — and the provider's
  // handshake would push the previous memo's CRDT state into the new room (cross-
  // document corruption). Recreating the doc with the id keeps each room's doc its
  // own: the provider below is rebuilt on the same key (so provider A is destroyed
  // by its effect cleanup before provider B connects), and the editor rebinds via
  // its `[ydoc, provider]` deps. The provider is constructed with `ownsDoc=false`,
  // so its destroy() never touches the doc; the previous doc is released to GC once
  // the old provider/editor drop it (no explicit destroy, which could race the
  // Tiptap binding's teardown across the component boundary).
  const ydoc = useMemo(() => new Y.Doc(), [collaborationId, recoveryGeneration]);

  // Stable refs for notify + t so the provider effect does not tear down on their
  // identity changes (t changes on every language switch).
  const notifyRef = useRef(notify);
  notifyRef.current = notify;
  const tRef = useRef(t);
  tRef.current = t;

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
          notifyRef.current(tRef.current('callout.memo.saveFailed'), 'warning');
          break;
        case 'read-only-state':
          setReadOnlyState({
            readOnly: !!message.readOnly,
            readOnlyCode: controlReasonToReadOnlyCode(message.reason),
          });
          break;
        case 'update-rejected':
          // The server refused this generation's update (e.g. a schema-invalid inline
          // image on a mixed-fleet client). Tell the user their change was not saved, then
          // DISCARD the poisoned generation — recreate the doc/provider so the fresh
          // generation resyncs the server-canonical state (never reuse the refused doc).
          notifyRef.current(tRef.current('callout.memo.updateRejected'), 'warning');
          // Drop readiness FIRST so the UI blocks edits until the fresh generation actually
          // resyncs: the destroyed provider's stale CONNECTED+synced state would otherwise
          // leave the overlay off and allow edits against the un-resynced new doc. The new
          // provider's own status/synced callbacks restore readiness once it has synced.
          setSynced(false);
          setStatus(MemoStatus.CONNECTING);
          setRecoveryGeneration(generation => generation + 1);
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

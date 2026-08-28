import type { Extensions } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Y from 'yjs';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { deriveCollaborationState } from '@/domain/collaboration/realTimeCollaboration/collaborationPhase';
import {
  type CollaborationStatus,
  isCollaborationStatus,
  MemoStatus,
} from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import {
  type ControlMessage,
  classifySessionEnd,
  controlReasonToReadOnlyCode,
  type SessionEndCode,
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

  const [status, setStatus] = useState<CollaborationStatus>(MemoStatus.CONNECTING);
  const [synced, setSynced] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | undefined>(undefined);
  // Authorization is session-owned state from the server. Browser connectivity is
  // derived separately below: an offline/online transition must never erase a
  // server-issued read-only decision.
  const [serverReadOnlyState, setServerReadOnlyState] = useState<{
    readOnly: boolean;
    readOnlyCode?: ReadOnlyCode;
  }>();
  const [sessionEndCode, setSessionEndCode] = useState<SessionEndCode | 'terminal-connection-close'>();
  const [hasEverSynced, setHasEverSynced] = useState(false);
  const [hasUnconfirmedLocalChanges, setHasUnconfirmedLocalChanges] = useState(false);
  const [replaceGeneration, setReplaceGeneration] = useState(false);

  // Bumped when the server REJECTS a memo update (`update-rejected`). A rejected
  // generation must be DISCARDED, not kept locally: the server refused it, so every
  // later clock-dependent edit would stack behind a struct the server never has. Bumping
  // this recreates the `Y.Doc` + provider below (the same mechanism as a room change), so
  // the editor rebinds via its `[ydoc, provider]` deps and the fresh provider resyncs the
  // server-canonical state — never reusing the refused doc. Mirrors the whiteboard's
  // discard-generation-and-resync recovery.
  const [documentGeneration, setDocumentGeneration] = useState(0);
  // A fresh admission uses a new provider/member over the SAME Y.Doc. This is
  // intentionally separate from documentGeneration: inactivity must not discard
  // offline/local edits, while schema/size poison must never reuse its Y.Doc.
  const [admissionGeneration, setAdmissionGeneration] = useState(0);

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
  const ydoc = useMemo(() => new Y.Doc(), [collaborationId, documentGeneration]);

  useEffect(() => {
    setHasEverSynced(false);
    setHasUnconfirmedLocalChanges(false);
    setReplaceGeneration(false);
  }, [ydoc]);

  // Stable refs for notify + t so the provider effect does not tear down on their
  // identity changes (t changes on every language switch).
  const notifyRef = useRef(notify);
  const tRef = useRef(t);

  useEffect(() => {
    notifyRef.current = notify;
    tRef.current = t;
  }, [notify, t]);

  // Provider construction is effect-owned because its Awareness instance and
  // browser/doc subscriptions are live resources. Constructing it in useMemo
  // leaks React StrictMode's discarded render instance. Pair the provider with
  // its room/doc so a render after an id change never exposes the previous room's
  // provider beside the new room's doc while the replacement effect is pending.
  const [providerSession, setProviderSession] = useState<{
    collaborationId: string;
    ydoc: Y.Doc;
    admissionGeneration: number;
    provider: UnifiedCollabProvider;
  }>();
  const provider =
    providerSession && providerSession.collaborationId === collaborationId && providerSession.ydoc === ydoc
      ? providerSession.provider
      : null;

  // Create the provider, wire its events, and connect from one effect-owned
  // lifecycle. Cleanup destroys every resource before a remount/replacement can
  // become the active session.
  useEffect(() => {
    if (!collaborationId) {
      setProviderSession(undefined);
      setStatus(MemoStatus.CONNECTING);
      setSynced(false);
      setLastSaveTime(undefined);
      setServerReadOnlyState(undefined);
      setSessionEndCode(undefined);
      return;
    }

    const nextProvider = new UnifiedCollabProvider({
      documentId: collaborationId,
      type: 'memo',
      doc: ydoc,
      connect: false,
      initialUnconfirmedLocalChanges: providerSession?.ydoc === ydoc && hasUnconfirmedLocalChanges,
    });

    // Admission replacement reuses this Y.Doc and therefore retains recovery
    // history; document replacement has a different Y.Doc and starts at initial.
    let didEverSync = providerSession?.ydoc === ydoc ? hasEverSynced : false;
    let currentReadOnly = false;

    const syncHandler = (isSynced: boolean) => {
      setSynced(isSynced);
      if (!isSynced) return;
      const recovered = didEverSync;
      didEverSync = true;
      setHasEverSynced(true);
      if (recovered && !currentReadOnly && nextProvider.hasUnconfirmedLocalChanges) {
        void nextProvider.requestDurability().catch(() => {
          // The provider retains the logical waiter across transient reconnects.
          // A terminal/deadline failure leaves `unconfirmed` true for the UI.
        });
      }
    };

    const statusHandler = (nextStatus: string) => {
      if (isCollaborationStatus(nextStatus)) {
        setStatus(nextStatus);
      } else {
        logWarn('UnknownMemoStatusError', { category: TagCategoryValues.MEMO, label: `Status: ${nextStatus}` });
      }
    };

    const closeHandler = (verdict: { disposition: 'terminal' | 'transient' }) => {
      if (verdict.disposition === 'terminal') {
        setSynced(false);
        setStatus(MemoStatus.DISCONNECTED);
        setSessionEndCode(current => current ?? 'terminal-connection-close');
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
          currentReadOnly = !!message.readOnly;
          setServerReadOnlyState({
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
          setReplaceGeneration(true);
          setDocumentGeneration(generation => generation + 1);
          break;
        case 'session-end': {
          // The server is ending this session. Classify against the KNOWN tuple table (the
          // authority); never trust the wire disposition/scope alone. A VALIDATED transient
          // (update-not-accepted) only DROPS UI readiness (+ a notice) so the editor blocks
          // edits during the server's queue→close-after-drain window — the provider's close
          // handler stays the SOLE reconnect owner, so we schedule nothing and recreate
          // nothing. An UNKNOWN or inconsistent tuple FAILS CLOSED (terminate, no reconnect),
          // matching the whiteboard and classifySessionEnd's contract. The concrete producer
          // is a rolling deploy where a NEWER server emits a session-end code this client's
          // table does not know: trusting the socket close that follows (often a transient
          // 1013/1001) would silently reconnect past a terminal condition and MASK data loss.
          // Disconnecting the provider tears down the socket and clears its reconnect timer.
          // The one manual tuple gets an explicit fresh-generation action below; terminal
          // and unknown tuples remain closed.
          const info = classifySessionEnd(message);
          if (info) {
            if (info.code === 'update-not-accepted') {
              notifyRef.current(tRef.current('callout.memo.updateNotAccepted'), 'warning');
              setSynced(false);
              setStatus(MemoStatus.CONNECTING);
            } else if (info.disposition !== 'transient') {
              setSynced(false);
              setStatus(MemoStatus.DISCONNECTED);
              setSessionEndCode(info.code);
              nextProvider.disconnect();
            }
            // A terminal/manual control is authoritative before the socket close arrives:
            // seal readiness, expose its reason, and stop this provider. Only the validated
            // transient leaves reconnect ownership with the provider's close handler.
          } else {
            notifyRef.current(tRef.current('callout.memo.sessionEnded'), 'warning');
            setSynced(false);
            setStatus(MemoStatus.DISCONNECTED);
            setSessionEndCode('terminal-connection-close');
            nextProvider.disconnect();
          }
          break;
        }
        default:
          break;
      }
    };

    nextProvider.on('status', statusHandler);
    nextProvider.on('synced', syncHandler);
    nextProvider.on('control', controlHandler);
    nextProvider.on('close', closeHandler);
    nextProvider.on('unconfirmed', setHasUnconfirmedLocalChanges);

    // Reset every room/generation-owned state in the same effect turn that
    // publishes the new provider. Room B must never observe room A's readiness,
    // save acknowledgement, or authorization while B is still awaiting SyncStep2.
    setStatus(MemoStatus.CONNECTING);
    setSynced(false);
    setLastSaveTime(undefined);
    setServerReadOnlyState(undefined);
    setSessionEndCode(undefined);
    setReplaceGeneration(false);
    setHasUnconfirmedLocalChanges(nextProvider.hasUnconfirmedLocalChanges);

    // Start the WebSocket connection now that event listeners are in place.
    setProviderSession({ collaborationId, ydoc, admissionGeneration, provider: nextProvider });
    nextProvider.connect();

    return () => {
      nextProvider.destroy();
    };
  }, [admissionGeneration, collaborationId, ydoc]);

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

  // Inactivity needs fresh admission but retains the SAME Y.Doc. A size-limit end
  // rejects the document generation and therefore replaces it. No terminal or
  // authorization reason is eligible for either action.
  const resumeEditing = () => {
    if (serverReadOnlyState?.readOnlyCode === ReadOnlyCode.INACTIVITY) {
      setAdmissionGeneration(generation => generation + 1);
    } else if (sessionEndCode === 'document-size-limit-exceeded') {
      setReplaceGeneration(true);
      setDocumentGeneration(generation => generation + 1);
    }
  };

  const { phase, access } = deriveCollaborationState({
    status:
      status === MemoStatus.CONNECTED ? 'connected' : status === MemoStatus.CONNECTING ? 'connecting' : 'disconnected',
    synced,
    hasEverSynced,
    readOnly: !!serverReadOnlyState?.readOnly,
    terminal: !!sessionEndCode && sessionEndCode !== 'document-size-limit-exceeded',
    replaceGeneration: replaceGeneration || sessionEndCode === 'document-size-limit-exceeded',
  });

  return {
    status,
    synced,
    lastSaveTime,
    phase,
    access,
    hasEverSynced,
    hasUnconfirmedLocalChanges,
    isReadOnly: access === 'readOnly' || phase === 'initial' || phase === 'terminal' || phase === 'replaceGeneration',
    readOnlyCode: serverReadOnlyState?.readOnlyCode,
    sessionEndCode,
    resumeEditing,
    retryNow: () => provider?.reconnectNow(),
    persistPendingChanges: (options?: { force?: boolean }) =>
      provider
        ? provider.persistPendingChanges(options)
        : Promise.reject(new Error('The collaboration provider is not available')),
    collaborationExtensions,
    ydoc,
    provider,
  };
};

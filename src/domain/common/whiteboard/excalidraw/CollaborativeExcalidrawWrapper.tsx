import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw-yjs/excalidraw/types';
import type React from 'react';
import { type PropsWithChildren, type Ref, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollaborationState } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { UnifiedCollabProvider } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { useCollaborationBeforeUnload } from '@/domain/collaboration/realTimeCollaboration/useCollaborationBeforeUnload';
import { resolveWhiteboardGuestIdentity } from '@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { bindWhiteboardEditor } from './collab/whiteboardEditorBinding';
import { ExcalidrawEditorBinding, type WhiteboardEditorEntities } from './ExcalidrawEditorBinding';

export type CollabAPI = {
  getState: () => CollaborationState;
  hasUnsavedChanges: () => boolean;
  requestDurability: () => Promise<void>;
};
export type WhiteboardCollaborationView = {
  lifecycle: CollaborationState;
  readOnlyReason: UnifiedCollabProvider['readOnlyReason'];
};
export interface WhiteboardWhiteboardProps {
  entities: WhiteboardEditorEntities;
  options: ExcalidrawProps;
  actions: {
    onInitApi?: (api: ExcalidrawImperativeAPI | null, whiteboardId: string) => void;
    onSceneInitChange?: (initialized: boolean) => void;
    onRemoteSave?: (error?: string) => void;
  };
  collabApiRef?: Ref<CollabAPI>;
  children: (props: PropsWithChildren<WhiteboardCollaborationView>) => React.ReactNode;
}

/** One whiteboard provider bound to one editor mount. All lifecycle policy stays in the provider. */
const CollaborativeExcalidrawWrapper = ({
  entities,
  actions,
  options,
  collabApiRef,
  children,
}: WhiteboardWhiteboardProps) => {
  const [editor, setEditor] = useState<{ api: ExcalidrawImperativeAPI; whiteboardId: string }>();
  const [view, setView] = useState<WhiteboardCollaborationView>({
    lifecycle: { kind: 'loading' },
    readOnlyReason: undefined,
  });
  const [controls, setControls] = useState<ReturnType<typeof bindWhiteboardEditor>>();
  const providerRef = useRef<UnifiedCollabProvider | null>(null);
  const collabApi = useMemo<CollabAPI>(
    () => ({
      getState: () => providerRef.current?.state ?? { kind: 'loading' },
      hasUnsavedChanges: () => providerRef.current?.hasUnsavedChanges ?? false,
      requestDurability: () =>
        providerRef.current?.requestDurability() ?? Promise.reject(new Error('Collaboration is not ready')),
    }),
    []
  );
  useImperativeHandle(collabApiRef, () => collabApi, [collabApi]);
  const { userModel } = useCurrentUserContext();
  const { t } = useTranslation();
  const guest = resolveWhiteboardGuestIdentity();
  const username = guest.isPublicRoute
    ? (guest.guestName ?? t('common.guestUserFallback'))
    : (userModel?.profile?.displayName ?? t('common.guestUserFallback'));

  useEffect(() => {
    const whiteboardId = entities.whiteboard?.id;
    if (!editor || !whiteboardId || editor.whiteboardId !== whiteboardId) return;
    const provider = new UnifiedCollabProvider({
      documentId: whiteboardId,
      type: 'whiteboard',
      scenePort: {
        encodeSceneStateVector: () => editor.api.encodeSceneStateVector(),
        encodeSceneAsUpdate: (format, target) => editor.api.encodeSceneAsUpdate(format, target),
        applyRemoteSceneUpdate: (update, format) => editor.api.applyRemoteSceneUpdate(update, format),
        onLocalSceneUpdate: (listener, format) => editor.api.onLocalSceneUpdate(listener, format),
      },
      guestName: guest.guestName,
      beforeSave: async () => {
        const report = await editor.api.flushAssetPublication();
        if (report.failed.length > 0) throw new Error('Whiteboard asset publication failed');
      },
      connect: false,
    });
    const binding = bindWhiteboardEditor(editor.api, provider.awareness, provider.ephemeralChannel);
    providerRef.current = provider;
    setControls(binding);
    let fitPending = true;
    const stopState = provider.subscribe(lifecycle => {
      setView({ lifecycle, readOnlyReason: provider.readOnlyReason });
      const active = lifecycle.kind === 'active';
      actions.onSceneInitChange?.(active);
      if (active && fitPending) {
        fitPending = false;
        binding.fitScene();
      }
    });
    const stopSave = provider.onSaveResult(actions.onRemoteSave ?? (() => undefined));
    provider.connect();
    return () => {
      stopState();
      stopSave();
      binding.destroy();
      provider.destroy();
      providerRef.current = null;
      setControls(undefined);
      setView({ lifecycle: { kind: 'loading' }, readOnlyReason: undefined });
    };
  }, [editor, entities.whiteboard?.id, guest.guestName]);

  useEffect(() => controls?.setUser(username), [controls, username]);

  useCollaborationBeforeUnload(view.lifecycle, collabApi.hasUnsavedChanges());
  const active = view.lifecycle.kind === 'active';
  return (
    <ExcalidrawEditorBinding
      entities={entities}
      options={options}
      onApi={(api, whiteboardId) => {
        setEditor(current =>
          api ? { api, whiteboardId } : current?.whiteboardId === whiteboardId ? undefined : current
        );
        actions.onInitApi?.(api, whiteboardId);
      }}
      loading={view.lifecycle.kind === 'loading'}
      collaborating={active}
      readOnly={view.lifecycle.kind !== 'active' || view.lifecycle.access === 'read'}
      onPointerUpdate={controls?.onPointerUpdate}
      onEmojiReaction={controls?.broadcastEmojiReaction}
      onCountdownTimer={controls?.broadcastCountdownTimer}
    >
      {({ children: content }) => children({ children: content, ...view })}
    </ExcalidrawEditorBinding>
  );
};

export default CollaborativeExcalidrawWrapper;

import { useApolloClient } from '@apollo/client';
import type { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateMemoDisplayNameMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { MemoCollabFooter } from '@/crd/components/memo/MemoCollabFooter';
import { MemoDisplayName } from '@/crd/components/memo/MemoDisplayName';
import { MemoEditorShell } from '@/crd/components/memo/MemoEditorShell';
import { CollaborativeMarkdownEditor } from '@/crd/forms/markdown/CollaborativeMarkdownEditor';
import type { CollabProviderLike, YDocLike } from '@/crd/forms/markdown/collabProviderTypes';
import { htmlToMarkdown } from '@/crd/forms/markdown/markdownConverter';
import useMemoManager from '@/domain/collaboration/memo/MemoManager/useMemoManager';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapMemoFooterProps } from './memoFooterMapper';
import { useCrdMemoProvider } from './useCrdMemoProvider';

type CrdMemoDialogProps = {
  open: boolean;
  memoId: string;
  onClose: () => void;
  /** True when this is a memo contribution (deletable), false for framing */
  isContribution?: boolean;
  onDelete?: () => Promise<void> | void;
};

export function CrdMemoDialog({ open, memoId, onClose, isContribution = false, onDelete }: CrdMemoDialogProps) {
  const { t } = useTranslation('crd-space');
  const client = useApolloClient();
  const { memo, loading } = useMemoManager({ id: memoId });
  const editorRef = useRef<Editor | null>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const { spaceLevel = SpaceLevel.L0 } = useUrlResolver();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const myMembershipStatus =
    spaceLevel === SpaceLevel.L0
      ? space.about.membership?.myMembershipStatus
      : subspace.about.membership?.myMembershipStatus;
  const { ydoc, provider, connectionStatus, synced, isReadOnly, memberCount, connectedUsers, user } =
    useCrdMemoProvider({
      collaborationId: memoId,
    });

  const handleEditorReady = (editor: Editor) => {
    editorRef.current = editor;
  };

  const [updateMemoDisplayName, { loading: savingDisplayName }] = useUpdateMemoDisplayNameMutation();
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const privileges = memo?.authorization?.myPrivileges ?? [];
  const hasUpdatePrivileges = privileges.includes(AuthorizationPrivilege.Update);
  const hasDeletePrivileges = privileges.includes(AuthorizationPrivilege.Delete);
  const hasContributePrivileges = privileges.includes(AuthorizationPrivilege.Contribute);

  const canEditDisplayName = isContribution && hasUpdatePrivileges;
  const displayName = memo?.profile.displayName ?? t('memo.errors.loading');

  const handleStartEdit = () => {
    setDisplayNameDraft(displayName);
    setEditingDisplayName(true);
  };

  const handleSaveDisplayName = async () => {
    if (!displayNameDraft.trim() || displayNameDraft === displayName) {
      setEditingDisplayName(false);
      return;
    }
    await updateMemoDisplayName({ variables: { memoId, displayName: displayNameDraft.trim() } });
    setEditingDisplayName(false);
  };

  const handleCancelEdit = () => setEditingDisplayName(false);

  // Write the editor's current content directly to Apollo cache so previews update instantly.
  // Hocuspocus's autosave lags by ~2s; fetching from the server immediately returns stale data.
  // Instead, we grab the HTML from Tiptap, convert to markdown, and write it to the normalized
  // cache entry. Connectors schedule a delayed server fetch as a safety net.
  const handleClose = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      // Fire-and-forget: write to cache as soon as conversion completes.
      // The dialog unmounts on close so we can't rely on timeouts; this runs
      // outside React lifecycle as a plain promise. Swallow failures — the
      // connector's delayed server refetch is the safety net.
      void htmlToMarkdown(html)
        .then(markdown => {
          client.cache.modify({
            id: client.cache.identify({ __typename: 'Memo', id: memoId }),
            fields: {
              markdown: () => markdown,
            },
          });
        })
        .catch(() => {});
    }
    onClose();
  };

  // The footer Delete button opens the confirmation; the actual delete runs from the
  // confirmation's `onConfirm` so users can't remove a memo with a stray click.
  const handleRequestDelete = onDelete ? () => setDeleteDialogOpen(true) : undefined;

  const handleConfirmDelete = onDelete
    ? async () => {
        setIsDeleting(true);
        setDeleteDialogOpen(false);
        onClose();
        try {
          await onDelete();
        } finally {
          setIsDeleting(false);
        }
      }
    : undefined;

  const footerProps = mapMemoFooterProps({
    connectionStatus,
    synced,
    isAuthenticated,
    isReadOnly,
    memberCount,
    connectedUsers,
    isContribution,
    hasDeletePrivileges,
    onDelete: handleRequestDelete,
    contentUpdatePolicy: memo?.contentUpdatePolicy,
    myMembershipStatus,
  });

  const editorDisabled = !synced || isReadOnly || !hasContributePrivileges;

  const title = (
    <MemoDisplayName
      displayName={displayName}
      value={displayNameDraft}
      readOnly={!canEditDisplayName}
      editing={editingDisplayName}
      saving={savingDisplayName}
      onChange={setDisplayNameDraft}
      onEdit={handleStartEdit}
      onSave={handleSaveDisplayName}
      onCancel={handleCancelEdit}
    />
  );

  const showLoadingState = loading || !memo || !ydoc || !provider;

  return (
    <>
      <MemoEditorShell open={open} onClose={handleClose} title={title} footer={<MemoCollabFooter {...footerProps} />}>
        {showLoadingState ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-body">
            {t('memo.errors.loading')}
          </div>
        ) : (
          <div className="h-full p-3">
            <CollaborativeMarkdownEditor
              ydoc={ydoc as unknown as YDocLike}
              provider={provider as unknown as CollabProviderLike}
              user={{ name: user.name, color: user.color }}
              disabled={editorDisabled}
              onReady={handleEditorReady}
              className="h-full"
            />
          </div>
        )}
      </MemoEditorShell>
      {handleConfirmDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t('memo.deleteConfirm.title')}
          description={t('memo.deleteConfirm.body')}
          confirmLabel={t('memo.deleteConfirm.confirm')}
          onConfirm={handleConfirmDelete}
          variant="destructive"
          loading={isDeleting}
        />
      )}
    </>
  );
}

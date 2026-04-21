import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateMemoDisplayNameMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { MemoCollabFooter } from '@/crd/components/memo/MemoCollabFooter';
import { MemoDisplayName } from '@/crd/components/memo/MemoDisplayName';
import { MemoEditorShell } from '@/crd/components/memo/MemoEditorShell';
import { CollaborativeMarkdownEditor } from '@/crd/forms/markdown/CollaborativeMarkdownEditor';
import type { CollabProviderLike, YDocLike } from '@/crd/forms/markdown/collabProviderTypes';
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
  const { memo, loading, refreshMarkdown } = useMemoManager({ id: memoId });
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const { spaceLevel = SpaceLevel.L0 } = useUrlResolver();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const myMembershipStatus =
    spaceLevel === SpaceLevel.L0
      ? space.about.membership?.myMembershipStatus
      : subspace.about.membership?.myMembershipStatus;
  const { ydoc, provider, connectionStatus, synced, isReadOnly, memberCount, user } = useCrdMemoProvider({
    collaborationId: memoId,
  });

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

  const [updateMemoDisplayName, { loading: savingDisplayName }] = useUpdateMemoDisplayNameMutation();
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState('');

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

  // Refetch the memo markdown after close so the framing/contribution previews get updated content.
  // Hocuspocus's final autosave to the GraphQL backend lags by up to a couple of seconds, so we
  // fetch immediately AND again after 2.5s to catch the autosave. Mirrors the MUI pattern used by
  // CalloutFramingMemo and CalloutContributionDialogMemo.
  const handleClose = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    void refreshMarkdown();
    refreshTimeoutRef.current = setTimeout(() => {
      void refreshMarkdown();
      refreshTimeoutRef.current = null;
    }, 2500);
    onClose();
  };

  const handleDelete = onDelete
    ? async () => {
        // Delete path: don't refresh the memo (it's about to be gone from the cache).
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
        onClose();
        await onDelete();
      }
    : undefined;

  const footerProps = mapMemoFooterProps({
    connectionStatus,
    synced,
    isAuthenticated,
    isReadOnly,
    memberCount,
    isContribution,
    hasDeletePrivileges,
    onDelete: handleDelete,
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
            className="h-full"
          />
        </div>
      )}
    </MemoEditorShell>
  );
}

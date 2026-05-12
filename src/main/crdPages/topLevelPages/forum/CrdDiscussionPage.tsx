import { compact } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchPlatformDiscussionsQuery,
  useDeleteDiscussionMutation,
  usePlatformDiscussionQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, type ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { ForumDiscussionDetail } from '@/crd/components/forum/ForumDiscussionDetail';
import { ForumDiscussionDetailSkeleton } from '@/crd/components/forum/ForumDiscussionDetailSkeleton';
import { ForumInitiateDiscussionDialog } from '@/crd/components/forum/ForumInitiateDiscussionDialog';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { useAuthorsDetails } from '@/domain/community/user/hooks/useAuthorsDetails';
import { DiscussionCommentsConnector } from '@/main/crdPages/topLevelPages/forum/DiscussionCommentsConnector';
import {
  ForumDiscussionFormConnector,
  type ForumDiscussionFormState,
} from '@/main/crdPages/topLevelPages/forum/ForumDiscussionFormConnector';
import { mapDiscussionToDetailData } from '@/main/crdPages/topLevelPages/forum/forumDataMapper';
import { ALL_SLUG, slugFor } from '@/main/crdPages/topLevelPages/forum/useCategorySlug';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const CrdDiscussionPage = () => {
  const { t } = useTranslation('crd-forum');
  const { t: tDefault, i18n } = useTranslation();
  const navigate = useNavigate();

  // The URL carries the discussion's nameId, not its UUID. Resolve via the
  // url-resolver context (the same way the legacy MUI Discussion page does in
  // src/domain/communication/discussion/pages/Discussion.tsx) — UrlResolverProvider
  // wraps this route in TopLevelRoutes.tsx.
  const { discussionId, loading: loadingResolver } = useUrlResolver();

  const { data, loading: loadingDiscussion } = usePlatformDiscussionQuery({
    variables: { discussionId: discussionId ?? '' },
    skip: !discussionId,
  });

  const rawDiscussion = data?.platform.forum.discussion;
  const messageSenderIds = rawDiscussion?.comments.messages?.map(m => m.sender?.id) ?? [];
  const authorIds = compact([rawDiscussion?.createdBy, ...messageSenderIds]);
  const { getAuthor } = useAuthorsDetails(authorIds);

  // Edit / delete dialog state. Always declared (no conditional hooks) — the
  // dialogs only render when we have a discussion and the right privileges.
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pendingDeleteDiscussion, setPendingDeleteDiscussion] = useState(false);
  const [editFormState, setEditFormState] = useState<ForumDiscussionFormState>({
    submitForm: () => {},
    submitDisabled: true,
    busy: false,
  });

  const [deleteDiscussion, { loading: deletingDiscussion }] = useDeleteDiscussionMutation({
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });

  const loading = loadingResolver || loadingDiscussion;

  const detailData = mapDiscussionToDetailData(
    rawDiscussion,
    {
      t,
      tDefault,
      locale: resolveDateFnsLocale(i18n.language),
      getAuthor,
    },
    rawDiscussion?.createdBy
  );

  if (loading || !rawDiscussion || !detailData) {
    return <ForumDiscussionDetailSkeleton loadingLabel={t('detail.loading')} />;
  }

  const activeSlug = detailData.categorySlug ?? slugFor(rawDiscussion.category);
  const backHref = activeSlug !== ALL_SLUG ? `/forum/${activeSlug}` : '/forum';

  const privileges = rawDiscussion.authorization?.myPrivileges ?? [];
  const canEditDiscussion = privileges.includes(AuthorizationPrivilege.Update);
  const canDeleteDiscussion = privileges.includes(AuthorizationPrivilege.Delete);

  const detailDataWithActions = {
    ...detailData,
    onEdit: canEditDiscussion ? () => setIsEditOpen(true) : undefined,
    onDelete: canDeleteDiscussion ? () => setPendingDeleteDiscussion(true) : undefined,
  };

  const handleConfirmDelete = async () => {
    await deleteDiscussion({
      variables: { deleteData: { ID: rawDiscussion.id } },
    });
    setPendingDeleteDiscussion(false);
    navigate(backHref);
  };

  return (
    <>
      <ForumDiscussionDetail
        data={detailDataWithActions}
        backHref={backHref}
        backLabel={t('detail.back')}
        shareLabel={t('detail.share')}
        editLabel={t('detail.edit')}
        deleteLabel={t('detail.delete')}
        commentsSlot={<DiscussionCommentsConnector roomId={rawDiscussion.comments.id} room={rawDiscussion.comments} />}
        onBack={() => navigate(backHref)}
      />

      {canEditDiscussion ? (
        <ForumInitiateDiscussionDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          mode="update"
          title={t('dialog.update.title')}
          submitLabel={t('dialog.update.submit')}
          cancelLabel={t('dialog.cancel')}
          closeLabel={t('dialog.close')}
          submitDisabled={editFormState.submitDisabled}
          busy={editFormState.busy}
          onSubmit={editFormState.submitForm}
        >
          <ForumDiscussionFormConnector
            mode="update"
            discussion={{
              id: rawDiscussion.id,
              title: detailData.title,
              description: rawDiscussion.profile.description ?? '',
              category: rawDiscussion.category as ForumDiscussionCategory,
            }}
            availableCategories={[rawDiscussion.category as ForumDiscussionCategory]}
            onStateChange={setEditFormState}
            onCompleted={() => setIsEditOpen(false)}
          />
        </ForumInitiateDiscussionDialog>
      ) : null}

      {canDeleteDiscussion ? (
        <ConfirmationDialog
          open={pendingDeleteDiscussion}
          onOpenChange={setPendingDeleteDiscussion}
          title={tDefault('components.discussion.delete-discussion')}
          description={t('dialog.delete.description')}
          confirmLabel={t('dialog.delete.confirm')}
          cancelLabel={t('dialog.cancel')}
          variant="destructive"
          loading={deletingDiscussion}
          onConfirm={() => {
            void handleConfirmDelete();
          }}
        />
      ) : null}
    </>
  );
};

export default CrdDiscussionPage;

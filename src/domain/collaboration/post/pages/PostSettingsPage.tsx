import { useCallback, useEffect, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { Autocomplete, Button, DialogActions, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PostForm, { PostFormInput, PostFormOutput } from '../PostForm/PostForm';
import usePostSettings from '../graphql/usePostSettings';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  PostSettingsFragment,
  AuthorizationPrivilege,
  Visual,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { PostDialogSection } from '../views/PostDialogSection';
import {
  useMoveContributionToCalloutMutation,
  usePostCalloutsInCalloutSetQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { normalizeLink } from '@/core/utils/links';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { PostLayout } from '../views/PostLayout';

export interface PostSettingsPageProps {
  onClose: () => void;
  calloutId: string | undefined;
  postId: string | undefined;
  calloutsSetId: string | undefined;
}

const PostSettingsPage = ({ postId, calloutId, calloutsSetId, onClose }: PostSettingsPageProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [post, setPost] = useState<PostFormOutput>();
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [closeConfirmDialogOpen, setCloseConfirmDialogOpen] = useState(false);

  const toPostFormInput = (post?: PostSettingsFragment): PostFormInput | undefined =>
    post && {
      id: post.id,
      profileData: {
        displayName: post.profile.displayName,
        description: post.profile.description!,
      },
      references: post?.profile.references,
    };

  const postSettings = usePostSettings({
    postId,
    calloutId,
  });

  const notify = useNotification();

  const canMoveCard = postSettings.post?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.MovePost);

  const [moveContributionToCallout, { loading: isMovingContribution }] = useMoveContributionToCalloutMutation({});

  const [targetCalloutId, setTargetCalloutId] = useState(postSettings.parentCallout?.id);

  useEffect(() => {
    setTargetCalloutId(postSettings.parentCallout?.id);
  }, [postSettings.parentCallout]);

  const isMoveEnabled = Boolean(targetCalloutId) && targetCalloutId !== postSettings.parentCallout?.id;

  const { data: calloutsData, refetch: refetchCallouts } = usePostCalloutsInCalloutSetQuery({
    variables: {
      calloutsSetId: calloutsSetId!,
    },
    skip: !calloutsSetId,
  });

  const calloutsOfTypePost = calloutsData?.lookup.calloutsSet?.callouts ?? [];

  // TODO This page component exposes too much of inner logic that should be encapsulated
  // either in a container/hook or a rendered view
  const visuals = (postSettings.post ? postSettings.post.profile.visuals : []) as Visual[];
  const isPostLoaded = Boolean(
    post && postSettings.post && !postSettings.updating && !postSettings.deleting && !isMovingContribution
  );

  const handleDelete = useCallback(async () => {
    if (!postSettings.post || !post) {
      return;
    }

    await postSettings.handleDelete(postSettings.post.id);
    onClose();
  }, [postSettings, post, onClose]);

  const onCloseEdit = useCallback(() => {
    setCloseConfirmDialogOpen(true);
  }, []);

  const [handleUpdate, loading] = useLoadingState(async (shouldUpdate: boolean) => {
    if (!postSettings.contributionId || !postSettings.post || !post) {
      return;
    }

    if (shouldUpdate) {
      await postSettings.handleUpdate({
        id: postSettings.post.id,
        displayName: post.displayName,
        description: post.description,
        tags: post.tags,
        references: post.references,
      });
    }

    if (isMoveEnabled) {
      const { data, errors } = await moveContributionToCallout({
        variables: {
          contributionId: postSettings.contributionId,
          calloutId: targetCalloutId!, // ensured by isMoveEnabled
        },
      });
      if (errors) {
        notify(t('post-edit.postLocation.error'), 'error');
      } else if (!shouldUpdate) {
        notify(t('post-edit.postLocation.success'), 'success');
      }
      const postURL = normalizeLink(data?.moveContributionToCallout.post?.profile.url ?? '');
      await refetchCallouts();
      navigate(`${postURL}/settings`, { replace: true });
    }
  });

  return (
    <PostLayout currentSection={PostDialogSection.Settings} onClose={onCloseEdit}>
      <StorageConfigContextProvider locationType="post" postId={postId}>
        <PostForm
          edit
          loading={postSettings.loading || postSettings.updating || isMovingContribution}
          post={toPostFormInput(postSettings.post)}
          postNames={postSettings.postsNames}
          onChange={setPost}
          onAddReference={postSettings.handleAddReference}
          onRemoveReference={postSettings.handleRemoveReference}
          tags={postSettings.post?.profile.tagset?.tags}
        >
          {({ isValid, dirty }) => {
            const canSave = isPostLoaded && dirty && isValid;

            return (
              <>
                <Box>
                  <Typography variant={'h4'}>{t('common.visuals')}</Typography>
                  {/* Do not show VisualType.Card for Posts for now, see #4362.
                      TODO: Maybe in the future we want to remove those visuals from the database,
                      for now Card profiles don't have a Banner because it's not shown anywhere */}
                  <EditVisualsView visuals={visuals} visualTypes={[VisualType.Banner]} />
                </Box>
                {canMoveCard && (
                  <Box>
                    <Typography variant={'h4'}>{t('post-edit.postLocation.title')}</Typography>
                    <Autocomplete
                      disablePortal
                      options={calloutsOfTypePost}
                      value={calloutsOfTypePost.find(({ id }) => id === targetCalloutId)}
                      getOptionLabel={callout => callout.framing.profile.displayName}
                      onChange={(event, callout) => {
                        setTargetCalloutId(callout?.id);
                      }}
                      disableClearable
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={t('post-edit.postLocation.label')}
                          helperText={t('post-edit.postLocation.reminder')}
                        />
                      )}
                    />
                  </Box>
                )}
                <DialogFooter>
                  <DialogActions>
                    <Button
                      aria-label="delete-post"
                      variant="outlined"
                      color="error"
                      disabled={!isPostLoaded}
                      onClick={() => setDeleteConfirmDialogOpen(true)}
                    >
                      {t('buttons.delete')}
                    </Button>
                    <Button
                      variant="contained"
                      disabled={!canSave && !isMoveEnabled}
                      loading={loading}
                      onClick={() => handleUpdate(canSave)}
                    >
                      {t('buttons.save')}
                    </Button>
                  </DialogActions>
                </DialogFooter>
              </>
            );
          }}
        </PostForm>
        <ConfirmationDialog
          actions={{
            onConfirm: handleDelete,
            onCancel: () => setDeleteConfirmDialogOpen(false),
          }}
          options={{
            show: Boolean(deleteConfirmDialogOpen),
          }}
          entities={{
            titleId: 'post-edit.delete.title',
            contentId: 'post-edit.delete.description',
            confirmButtonTextId: 'buttons.delete',
          }}
        />
        <ConfirmationDialog
          actions={{
            onConfirm: () => {
              setCloseConfirmDialogOpen(false);
              onClose();
            },
            onCancel: () => setCloseConfirmDialogOpen(false),
          }}
          options={{
            show: closeConfirmDialogOpen,
          }}
          entities={{
            titleId: 'post-edit.closeConfirm.title',
            contentId: 'post-edit.closeConfirm.description',
            confirmButtonTextId: 'buttons.yes-close',
          }}
        />
      </StorageConfigContextProvider>
    </PostLayout>
  );
};

export default PostSettingsPage;

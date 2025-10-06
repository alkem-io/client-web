import { useEffect, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { Autocomplete, DialogActions, DialogContent, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import PostForm, { PostFormInput, PostFormOutput } from '../../post/PostForm/PostForm';
import usePostSettings from '../../post/graphql/usePostSettings';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  PostSettingsFragment,
  AuthorizationPrivilege,
  Visual,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import {
  useDeleteContributionMutation,
  useMoveContributionToCalloutMutation,
  usePostCalloutsInCalloutSetQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { normalizeLink } from '@/core/utils/links';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';
import { EditOutlined } from '@mui/icons-material';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import Gutters from '@/core/ui/grid/Gutters';
import useEnsurePresence from '@/core/utils/ensurePresence';
import SaveButton from '@/core/ui/actions/SaveButton';
import DeleteButton from '@/core/ui/actions/DeleteButton';

interface CalloutContributionDialogPostProps extends CalloutContributionPreviewDialogProps {}

const CalloutContributionDialogPost = ({
  open,
  onClose,
  calloutsSetId,
  calloutId,
  contribution,
  onContributionDeleted,
}: CalloutContributionDialogPostProps) => {
  const postId = contribution?.post?.id;
  const ensurePresence = useEnsurePresence();
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [post, setPost] = useState<PostFormOutput>();
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [closeConfirmDialogOpen, setCloseConfirmDialogOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);

  const toPostFormInput = (post?: PostSettingsFragment): PostFormInput | undefined =>
    post && {
      id: post.id,
      profileData: {
        displayName: post.profile.displayName,
        description: post.profile.description,
      },
      references: post?.profile.references,
    };

  const [deleteContribution] = useDeleteContributionMutation();
  const onPostDeleted = async () => {
    const contributionId = ensurePresence(contribution?.id, 'ContributionId');

    await deleteContribution({
      variables: {
        contributionId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
      onCompleted: data => {
        onContributionDeleted(data.deleteContribution.id);
      },
    });
  };

  const postSettings = usePostSettings({
    postId,
    calloutId,
    contributionId: contribution?.id,
    skip: !open,
    onPostDeleted,
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

  const handleDelete = async () => {
    if (!postSettings.post || !post) {
      return;
    }
    setDeleteConfirmDialogOpen(false);

    // close the dialog optimistically before deleting to prevent errors querying the post settings
    // use the inClose directly as we don't want to show the confirmation dialog
    onClose();

    await postSettings.handleDelete(postSettings.post.id);
  };

  const onCloseEdit = () => {
    if (canSave) {
      setCloseConfirmDialogOpen(true);
    } else {
      onClose();
    }
  };

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
      await refetchCallouts();
      const postUrl = data?.moveContributionToCallout.post?.profile.url;
      if (postUrl) {
        navigate(buildSettingsUrl(normalizeLink(postUrl)), { replace: true });
      }
    }
  });

  return (
    <>
      <DialogWithGrid open={open} columns={12} onClose={onCloseEdit} aria-labelledby="post-dialog-title">
        <DialogHeader id="post-dialog-title" onClose={onCloseEdit} icon={<EditOutlined />}>
          {t('post-edit.edit')}
        </DialogHeader>
        <DialogContent>
          <StorageConfigContextProvider locationType="post" postId={postId}>
            <PostForm
              edit
              loading={postSettings.loading || postSettings.updating || isMovingContribution}
              post={toPostFormInput(postSettings.post)}
              onChange={setPost}
              canSave={setCanSave}
              onAddReference={postSettings.handleAddReference}
              onRemoveReference={postSettings.handleRemoveReference}
              tags={postSettings.post?.profile.tagset?.tags}
            >
              {() => (
                <Gutters>
                  <Typography variant={'h4'}>{t('common.visuals')}</Typography>
                  {/* Do not show VisualType.Card for Posts for now, see #4362.
                    TODO: Maybe in the future we want to remove those visuals from the database,
                    for now Card profiles don't have a Banner because it's not shown anywhere */}
                  <EditVisualsView visuals={visuals} visualTypes={[VisualType.Banner]} />
                  {canMoveCard && (
                    <>
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
                    </>
                  )}
                </Gutters>
              )}
            </PostForm>
          </StorageConfigContextProvider>
        </DialogContent>
        <DialogActions>
          <DeleteButton disabled={!isPostLoaded} onClick={() => setDeleteConfirmDialogOpen(true)} />
          <SaveButton disabled={!canSave && !isMoveEnabled} loading={loading} onClick={() => handleUpdate(canSave)} />
        </DialogActions>
      </DialogWithGrid>
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
    </>
  );
};

export default CalloutContributionDialogPost;

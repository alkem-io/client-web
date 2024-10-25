import React, { FC, useEffect, useState } from 'react';
import useNavigate from '../../../../core/routing/useNavigate';
import { Autocomplete, Button, DialogActions, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PostForm, { PostFormInput, PostFormOutput } from '../PostForm/PostForm';
import usePostSettings from '../containers/PostSettings/usePostSettings';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import {
  PostSettingsFragment,
  AuthorizationPrivilege,
  CalloutType,
  Visual,
  VisualType,
} from '../../../../core/apollo/generated/graphql-schema';
import EditVisualsView from '../../../common/visual/EditVisuals/EditVisualsView';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import { PostDialogSection } from '../views/PostDialogSection';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import useCallouts from '../../callout/useCallouts/useCallouts';
import { useMoveContributionToCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../shared/utils/useLoadingState';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { normalizeLink } from '../../../../core/utils/links';
import { DialogFooter } from '../../../../core/ui/dialog/DialogWithGrid';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import { useStorageConfigLocally } from '../../../storage/StorageBucket/useStorageConfigLocally';

export interface PostSettingsPageProps {
  onClose: () => void;
  journeyTypeName: JourneyTypeName;
}

const PostSettingsPage: FC<PostSettingsPageProps> = ({ journeyTypeName, onClose }) => {
  const { t } = useTranslation();
  const { postNameId } = useUrlParams();
  const { calloutId } = useRouteResolver();

  const navigate = useNavigate();

  const [post, setPost] = useState<PostFormOutput>();
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const toPostFormInput = (post?: PostSettingsFragment): PostFormInput | undefined =>
    post && {
      id: post.id,
      nameID: post.nameID,
      profileData: {
        displayName: post.profile.displayName,
        description: post.profile.description!,
      },
      references: post?.profile.references,
    };

  const postSettings = usePostSettings({
    postNameId,
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

  const { journeyId } = useRouteResolver();

  const { callouts, refetchCallouts } = useCallouts({
    journeyId,
    journeyTypeName,
  });

  const calloutsOfTypePost = callouts?.filter(({ type }) => type === CalloutType.PostCollection);

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

    await postSettings.handleDelete(postSettings.post.id);
    onClose();
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
      const postURL = normalizeLink(data?.moveContributionToCallout.post?.profile.url ?? '');
      await refetchCallouts();
      navigate(`${postURL}/settings`, { replace: true });
    }
  });

  const { setLastOpenedStorageConfig } = useStorageConfigLocally();

  useEffect(() => {
    setLastOpenedStorageConfig(calloutId ?? '');
  }, [calloutId, setLastOpenedStorageConfig]);

  return (
    <PostLayout currentSection={PostDialogSection.Settings} onClose={onClose}>
      <StorageConfigContextProvider locationType="post" postId={postNameId} calloutId={calloutId}>
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
                <SectionSpacer double />
                <Box>
                  <Typography variant={'h4'}>{t('common.visuals')}</Typography>
                  <SectionSpacer />
                  {/* Do not show VisualType.Card for Posts for now, see #4362.
                      TODO: Maybe in the future we want to remove those visuals from the database,
                      for now Card profiles don't have a Banner because it's not shown anywhere */}
                  <EditVisualsView visuals={visuals} visualTypes={[VisualType.Banner]} />
                </Box>
                <SectionSpacer double />
                {canMoveCard && (
                  <Box>
                    <Typography variant={'h4'}>{t('post-edit.postLocation.title')}</Typography>
                    <SectionSpacer />
                    <Autocomplete
                      disablePortal
                      options={calloutsOfTypePost ?? []}
                      value={callouts?.find(({ id }) => id === targetCalloutId) ?? null!}
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
                    <LoadingButton
                      variant="contained"
                      disabled={!canSave && !isMoveEnabled}
                      loading={loading}
                      onClick={() => handleUpdate(canSave)}
                    >
                      {t('buttons.save')}
                    </LoadingButton>
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
      </StorageConfigContextProvider>
    </PostLayout>
  );
};

export default PostSettingsPage;

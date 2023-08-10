import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useResolvedPath } from 'react-router-dom';
import { Autocomplete, Button, TextField } from '@mui/material';
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
import { useMovePostToCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { buildPostUrl } from '../../../../common/utils/urlBuilders';
import { StorageConfigContextProvider } from '../../../platform/storage/StorageBucket/StorageConfigContext';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../shared/utils/useLoadingState';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';

export interface PostSettingsPageProps {
  onClose: () => void;
  journeyTypeName: JourneyTypeName;
}

const PostSettingsPage: FC<PostSettingsPageProps> = ({ journeyTypeName, onClose }) => {
  const { t } = useTranslation();
  const { spaceNameId = '', challengeNameId, opportunityNameId, postNameId = '', calloutNameId = '' } = useUrlParams();
  const resolved = useResolvedPath('.');
  const navigate = useNavigate();

  const [post, setPost] = useState<PostFormOutput>();
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const toPostFormInput = (post?: PostSettingsFragment): PostFormInput | undefined =>
    post && {
      id: post.id,
      nameID: post.nameID,
      type: post.type,
      profileData: {
        displayName: post.profile.displayName,
        description: post.profile.description!,
      },
      references: post?.profile.references,
    };

  const postIndex = resolved.pathname.indexOf('/posts');
  const contributeUrl = resolved.pathname.substring(0, postIndex);

  const postSettings = usePostSettings({
    postNameId,
    spaceNameId,
    challengeNameId,
    opportunityNameId,
    calloutNameId,
  });

  const notify = useNotification();

  const canMoveCard = postSettings.post?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.MovePost);

  const [movePostToCallout, { loading: isMovingPost }] = useMovePostToCalloutMutation({});

  const [targetCalloutId, setTargetCalloutId] = useState(postSettings.parentCallout?.id);

  useEffect(() => {
    setTargetCalloutId(postSettings.parentCallout?.id);
  }, [postSettings.parentCallout]);

  const isMoveEnabled = Boolean(targetCalloutId) && targetCalloutId !== postSettings.parentCallout?.id;

  const { callouts, refetchCallouts } = useCallouts({
    spaceNameId,
    challengeNameId,
    opportunityNameId,
  });

  const calloutsOfTypePost = callouts?.filter(({ type }) => type === CalloutType.PostCollection);

  // TODO This page component exposes too much of inner logic that should be encapsulated
  // either in a container/hook or a rendered view
  const visuals = (postSettings.post ? postSettings.post.profile.visuals : []) as Visual[];
  const isPostLoaded = Boolean(
    post && postSettings.post && !postSettings.updating && !postSettings.deleting && !isMovingPost
  );

  const handleDelete = async () => {
    if (!postSettings.post || !post) {
      return;
    }

    await postSettings.handleDelete(postSettings.post.id);
    navigate(contributeUrl);
  };

  const [handleUpdate, loading] = useLoadingState(async (shouldUpdate: boolean) => {
    if (!postSettings.post || !post) {
      return;
    }

    if (shouldUpdate) {
      await postSettings.handleUpdate({
        id: postSettings.post.id,
        displayName: post.displayName,
        type: post.type,
        description: post.description,
        tags: post.tags,
        references: post.references,
      });
    }

    if (isMoveEnabled) {
      const { data, errors } = await movePostToCallout({
        variables: {
          postId: postSettings.post.id,
          calloutId: targetCalloutId!, // ensured by isMoveEnabled
        },
      });
      if (errors) {
        notify(t('post-edit.postLocation.error'), 'error');
      } else if (!shouldUpdate) {
        notify(t('post-edit.postLocation.success'), 'success');
      }
      const targetCalloutNameId = data!.movePostToCallout.callout!.nameID;
      const postNameId = data!.movePostToCallout.nameID;
      const postURL = buildPostUrl(targetCalloutNameId, postNameId, {
        spaceNameId,
        challengeNameId,
        opportunityNameId,
      });
      await refetchCallouts();
      navigate(`${postURL}/settings`, { replace: true });
    }
  });

  return (
    <PostLayout currentSection={PostDialogSection.Settings} onClose={onClose}>
      <StorageConfigContextProvider
        locationType="post"
        postId={postNameId}
        calloutId={calloutNameId}
        journeyTypeName={journeyTypeName}
        spaceNameId={spaceNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      >
        <PostForm
          edit
          loading={postSettings.loading || postSettings.updating || isMovingPost}
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
                      getOptionLabel={callout => callout.profile.displayName}
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
                <Box sx={{ display: 'flex', justifyContent: 'end', marginTop: 2, gap: theme => theme.spacing(1) }}>
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
                </Box>
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

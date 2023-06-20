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
} from '../../../../core/apollo/generated/graphql-schema';
import EditVisualsView from '../../../common/visual/views/EditVisualsView';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import { PostDialogSection } from '../views/PostDialogSection';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import useCallouts from '../../callout/useCallouts/useCallouts';
import { useMovePostToCalloutMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { buildPostUrl } from '../../../../common/utils/urlBuilders';
import { StorageConfigContextProvider } from '../../../platform/storage/StorageBucket/StorageConfigContext';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';

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

  const { entities, state, actions } = usePostSettings({
    postNameId,
    spaceNameId,
    challengeNameId,
    opportunityNameId,
    calloutNameId,
  });

  console.log(entities);
  const notify = useNotification();

  const canMoveCard = entities.post?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.MovePost);

  const [movePostToCallout, { loading: isMovingPost }] = useMovePostToCalloutMutation({});

  const [targetCalloutId, setTargetCalloutId] = useState(entities.parentCallout?.id);

  useEffect(() => {
    setTargetCalloutId(entities.parentCallout?.id);
  }, [entities.parentCallout]);

  const isMoveEnabled = Boolean(targetCalloutId) && targetCalloutId !== entities.parentCallout?.id;

  const { callouts, refetchCallouts } = useCallouts({
    spaceNameId,
    challengeNameId,
    opportunityNameId,
  });

  const calloutsOfTypePost = callouts?.filter(({ type }) => type === CalloutType.Post);

  // TODO This page component exposes too much of inner logic that should be encapsulated
  // either in a container/hook or a rendered view
  const visuals = (entities.post ? entities.post.profile.visuals : []) as Visual[];
  const isPostLoaded = Boolean(post && entities.post && !state.updating && !state.deleting && !isMovingPost);

  const handleDelete = async () => {
    if (!entities.post || !post) {
      return;
    }

    await actions.handleDelete(entities.post.id);
    navigate(contributeUrl);
  };

  const handleUpdate = async (shouldUpdate: boolean) => {
    if (!entities.post || !post) {
      return;
    }

    if (shouldUpdate) {
      await actions.handleUpdate({
        id: entities.post.id,
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
          postId: entities.post.id,
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
  };

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
          loading={state.loading || state.updating || isMovingPost}
          post={toPostFormInput(entities.post)}
          postNames={entities.postsNames}
          onChange={setPost}
          onAddReference={actions.handleAddReference}
          onRemoveReference={actions.handleRemoveReference}
          tags={entities.post?.profile.tagset?.tags}
        >
          {({ isValid, dirty }) => {
            const canSave = isPostLoaded && dirty && isValid;

            return (
              <>
                <SectionSpacer double />
                <Box>
                  <Typography variant={'h4'}>{t('common.visuals')}</Typography>
                  <SectionSpacer />
                  <EditVisualsView visuals={visuals} />
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
                    onClick={handleDelete}
                  >
                    {t('buttons.delete')}
                  </Button>
                  <Button
                    aria-label="save-post"
                    variant="contained"
                    disabled={!canSave && !isMoveEnabled}
                    onClick={() => handleUpdate(canSave)}
                  >
                    {t('buttons.save')}
                  </Button>
                </Box>
              </>
            );
          }}
        </PostForm>
      </StorageConfigContextProvider>
    </PostLayout>
  );
};

export default PostSettingsPage;

import { ApolloError } from '@apollo/client';
import { PushFunc, RemoveFunc, useEditReference } from '../../../../common/reference/useEditReference';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  useChallengePostSettingsQuery,
  useDeletePostMutation,
  useOpportunityPostSettingsQuery,
  useSpacePostSettingsQuery,
  useUpdatePostMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  Post,
  PostSettingsCalloutFragment,
  PostSettingsFragment,
  Profile,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../../common/profile/Profile';
import { newReferenceName } from '../../../../common/reference/newReferenceName';
import removeFromCache from '../../../../../core/apollo/utils/removeFromCache';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

type PostUpdateData = Pick<Post, 'id' | 'type'> & {
  displayName: Profile['displayName'];
  description: string;
  tags: string[];
  references?: Reference[];
};

export interface PostSettingsContainerEntities {
  contributionId?: string;
  post?: PostSettingsFragment;
  postsNames?: string[] | undefined;
  parentCallout: PostSettingsCalloutFragment | undefined;
}

export interface PostSettingsContainerActions {
  handleUpdate: (post: PostUpdateData) => Promise<void>;
  handleAddReference: (push: PushFunc, referencesLength: number) => void;
  handleRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
  handleDelete: (id: string) => Promise<void>;
}

export interface PostSettingsContainerState {
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  error?: ApolloError;
  updateError?: ApolloError;
}

export interface PostSettingsContainerProps {
  spaceNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  postNameId: string;
  calloutNameId: string;
}

const usePostSettings = ({
  spaceNameId,
  postNameId,
  challengeNameId,
  opportunityNameId,
  calloutNameId,
}: PostSettingsContainerProps): PostSettingsContainerEntities &
  PostSettingsContainerActions &
  PostSettingsContainerState => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();
  const isPostDefined = postNameId && spaceNameId;

  const {
    data: spaceData,
    loading: spaceLoading,
    error: spaceError,
  } = useSpacePostSettingsQuery({
    variables: { spaceNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !!(challengeNameId || opportunityNameId),
  });

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengePostSettingsQuery({
    variables: { spaceNameId, challengeNameId: challengeNameId ?? '', postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !challengeNameId || !!opportunityNameId,
  });

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityPostSettingsQuery({
    variables: { spaceNameId, opportunityNameId: opportunityNameId ?? '', postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !opportunityNameId,
  });

  const collaborationCallouts =
    spaceData?.space?.collaboration?.callouts ??
    challengeData?.space?.challenge?.collaboration?.callouts ??
    opportunityData?.space?.opportunity?.collaboration?.callouts;

  const parentCallout = collaborationCallouts?.find(c => c.nameID === calloutNameId);
  const parentCalloutPostNames = compact(
    parentCallout?.postNames?.map(contribution => contribution.post?.profile.displayName)
  );

  const postContribution = parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId);
  const loading = spaceLoading || challengeLoading || opportunityLoading;
  const error = spaceError ?? challengeError ?? opportunityError;

  const [updatePost, { loading: updating, error: updateError }] = useUpdatePostMutation({
    onCompleted: () => notify('Post updated successfully', 'success'),
  });

  const handleUpdate = async (newPost: PostUpdateData) => {
    if (postContribution?.post) {
      await updatePost({
        variables: {
          input: {
            ID: newPost.id,
            profileData: {
              displayName: newPost.displayName,
              description: newPost.description,
              references: newPost.references?.map(x => ({
                ID: x.id ?? '',
                name: x.name,
                description: x.description,
                uri: x.uri,
              })),
              tagsets: [
                {
                  ID: postContribution.post.profile.tagset?.id ?? '',
                  tags: newPost.tags,
                },
              ],
            },
            type: newPost.type,
          },
        },
      });
    }
  };

  const [deletePost, { loading: deleting }] = useDeletePostMutation({
    update: removeFromCache,
  });

  const handleDelete = async (id: string) => {
    await deletePost({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const handleAddReference = (push: PushFunc, referencesLength: number) => {
    setPush(push);
    if (postContribution?.post) {
      addReference({
        profileId: postContribution.post.profile.id,
        name: newReferenceName(t, referencesLength),
      });
    }
  };

  const handleRemoveReference = (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return {
    contributionId: postContribution?.id,
    post: postContribution?.post,
    postsNames: parentCalloutPostNames,
    parentCallout,
    loading,
    error,
    updating,
    deleting,
    updateError,
    handleUpdate,
    handleAddReference,
    handleRemoveReference,
    handleDelete,
  };
};

export default usePostSettings;

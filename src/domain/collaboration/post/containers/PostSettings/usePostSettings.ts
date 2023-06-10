import { ApolloError } from '@apollo/client';
import { ContainerHook } from '../../../../../core/container/container';
import { PushFunc, RemoveFunc, useEditReference } from '../../../../shared/Reference/useEditReference';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  useChallengePostSettingsQuery,
  useDeletePostMutation,
  useHubPostSettingsQuery,
  useOpportunityPostSettingsQuery,
  useUpdatePostMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import {
  Post,
  PostSettingsCalloutFragment,
  PostSettingsFragment,
  Profile,
} from '../../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../../common/profile/Profile';
import { newReferenceName } from '../../../../../common/utils/newReferenceName';
import removeFromCache from '../../../../shared/utils/apollo-cache/removeFromCache';
import { getCardCallout } from '../getPostCallout';

type PostUpdateData = Pick<Post, 'id' | 'type'> & {
  displayName: Profile['displayName'];
  description: string;
  tags: string[];
  references?: Reference[];
};

export interface PostSettingsContainerEntities {
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
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  postNameId: string;
  calloutNameId: string;
}

const usePostSettings: ContainerHook<
  PostSettingsContainerProps,
  PostSettingsContainerEntities,
  PostSettingsContainerActions,
  PostSettingsContainerState
> = ({ hubNameId, postNameId, challengeNameId, opportunityNameId, calloutNameId }) => {
  const notify = useNotification();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();
  const isPostDefined = postNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubPostSettingsQuery({
    variables: { hubNameId, postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !!(challengeNameId || opportunityNameId),
  });

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengePostSettingsQuery({
    variables: { hubNameId, challengeNameId: challengeNameId ?? '', postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !challengeNameId || !!opportunityNameId,
  });

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityPostSettingsQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId ?? '', postNameId, calloutNameId },
    skip: !calloutNameId || !isPostDefined || !opportunityNameId,
  });

  const collaborationCallouts =
    hubData?.hub?.collaboration?.callouts ??
    challengeData?.hub?.challenge?.collaboration?.callouts ??
    opportunityData?.hub?.opportunity?.collaboration?.callouts;

  // TODO fetch calloutID for the Post for building a reliable link between entities
  const parentCallout = getCardCallout(collaborationCallouts, postNameId);
  const parentCalloutPostNames = parentCallout?.postNames?.map(x => x.profile.displayName);

  const post = parentCallout?.posts?.find(x => x.nameID === postNameId);
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const [updatePost, { loading: updating, error: updateError }] = useUpdatePostMutation({
    onCompleted: () => notify('Post updated successfully', 'success'),
  });

  const handleUpdate = async (newPost: PostUpdateData) => {
    if (post) {
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
                  ID: post.profile.tagset?.id ?? '',
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
    if (post) {
      addReference({
        profileId: post.profile.id,
        name: newReferenceName(referencesLength),
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
    entities: { post, postsNames: parentCalloutPostNames, parentCallout },
    state: { loading, error, updating, deleting, updateError },
    actions: { handleUpdate, handleAddReference, handleRemoveReference, handleDelete },
  };
};

export default usePostSettings;

import { ApolloError } from '@apollo/client';
import { PushFunc, RemoveFunc, useEditReference } from '@/domain/common/reference/useEditReference';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  useDeletePostMutation,
  usePostSettingsQuery,
  useUpdatePostMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  Post,
  PostSettingsCalloutFragment,
  PostSettingsFragment,
  Profile,
} from '@/core/apollo/generated/graphql-schema';
import { Reference } from '@/domain/common/profile/Profile';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import removeFromCache from '@/core/apollo/utils/removeFromCache';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

type PostUpdateData = Pick<Post, 'id'> & {
  displayName: Profile['displayName'];
  description: Profile['description'];
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
  postNameId: string | undefined;
  calloutId: string | undefined;
}

const usePostSettings = ({
  postNameId,
  calloutId,
}: PostSettingsContainerProps): PostSettingsContainerEntities &
  PostSettingsContainerActions &
  PostSettingsContainerState => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();

  const { data, loading, error } = usePostSettingsQuery({
    variables: {
      postNameId: postNameId!,
      calloutId: calloutId!,
    },
    skip: !calloutId || !postNameId,
  });

  const parentCallout = data?.lookup.callout;

  const parentCalloutPostNames = compact(
    parentCallout?.postNames?.map(contribution => contribution.post?.profile.displayName)
  );

  const postContribution = parentCallout?.contributions?.find(x => x.post && x.post.nameID === postNameId);

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

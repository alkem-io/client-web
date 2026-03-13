import type { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import {
  useDeletePostMutation,
  usePostSettingsQuery,
  useUpdatePostMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  Post,
  PostSettingsCalloutFragment,
  PostSettingsFragment,
  Profile,
} from '@/core/apollo/generated/graphql-schema';
import removeFromCache from '@/core/apollo/utils/removeFromCache';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { type PushFunc, type RemoveFunc, useEditReference } from '@/domain/common/reference/useEditReference';

type PostUpdateData = Pick<Post, 'id'> & {
  displayName: Profile['displayName'];
  description: Profile['description'];
  tags: string[];
  references?: ReferenceModel[];
};

export interface PostSettingsContainerEntities {
  post?: PostSettingsFragment;
  postsNames?: string[] | undefined;
  parentCallout: PostSettingsCalloutFragment | undefined;
}

export interface PostSettingsContainerActions {
  handleUpdate: (post: PostUpdateData) => Promise<void>;
  handleAddReference: (push: PushFunc, referencesLength: number) => void;
  handleRemoveReference?: (ref: ReferenceModel, remove: RemoveFunc) => void;
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
  calloutId: string | undefined;
  postId: string | undefined;
  skip?: boolean;
  onPostDeleted?: () => void;
}

const usePostSettings = ({
  calloutId,
  postId,
  skip,
  onPostDeleted,
}: PostSettingsContainerProps): PostSettingsContainerEntities &
  PostSettingsContainerActions &
  PostSettingsContainerState => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();

  const { data, loading, error } = usePostSettingsQuery({
    variables: {
      postId: postId!,
      calloutId: calloutId!,
    },
    skip: skip || !calloutId || !postId,
  });

  const parentCallout = data?.lookup.callout;

  const post = data?.lookup.post;

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
          },
        },
      });
    }
  };

  const [deletePost, { loading: deleting }] = useDeletePostMutation({
    update: removeFromCache,
  });
  const handleDelete = async (postId: string) => {
    await deletePost({ variables: { postId } });
    onPostDeleted?.();
  };

  const handleAddReference = (push: PushFunc, referencesLength: number) => {
    setPush(push);
    if (post) {
      addReference({
        profileId: post.profile.id,
        name: newReferenceName(t, referencesLength),
      });
    }
  };

  const handleRemoveReference = (ref: ReferenceModel, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return {
    post,
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

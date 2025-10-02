import { ApolloError } from '@apollo/client';
import { PushFunc, RemoveFunc, useEditReference } from '@/domain/common/reference/useEditReference';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  useDeleteContributionMutation,
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
import { newReferenceName } from '@/domain/common/reference/newReferenceName';
import removeFromCache from '@/core/apollo/utils/removeFromCache';
import { useTranslation } from 'react-i18next';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

type PostUpdateData = Pick<Post, 'id'> & {
  displayName: Profile['displayName'];
  description: Profile['description'];
  tags: string[];
  references?: ReferenceModel[];
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
  contributionId: string | undefined;
  postId: string | undefined;
  skip?: boolean;
}

const usePostSettings = ({
  calloutId,
  contributionId,
  postId,
  skip,
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
  const postContribution = parentCallout?.contributions?.find(x => x.post && x.post.id === postId);

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
  const [deleteContribution, { loading: deletingContribution }] = useDeleteContributionMutation({
    update: removeFromCache,
  })

  const handleDelete = async (postId: string) => {
    await deletePost({ variables: { postId } });
    if (contributionId) {
      await deleteContribution({ variables: { contributionId } });
    }
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
    contributionId: postContribution?.id,
    post,
    parentCallout,
    loading,
    error,
    updating,
    deleting: deleting || deletingContribution,
    updateError,
    handleUpdate,
    handleAddReference,
    handleRemoveReference,
    handleDelete,
  };
};

export default usePostSettings;

import { useCreatePostFromContributeTabMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { Ref } from 'react';
import { useInView } from 'react-intersection-observer';
import { PostContributionProps, useCalloutPosts } from './useCalloutPosts';

interface PostCalloutContainerProvided {
  ref: Ref<Element>;
  posts: PostContributionProps[];
  loading: boolean;
  onCreatePost: (post: CreatePostInput) => Promise<unknown>;
  creatingPost: boolean;
  canCreate: boolean;
}

interface PostCalloutContainerProps extends SimpleContainerProps<PostCalloutContainerProvided> {
  callout: {
    id: string;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
  };
}

const PostCalloutContainer = ({ callout, children }: PostCalloutContainerProps) => {
  const calloutId = callout.id;
  const { ref: intersectionObserverRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { posts, loading } = useCalloutPosts({
    calloutId,
    skip: !inView,
  });

  const [createPost, { loading: isCreatingPost }] = useCreatePostFromContributeTabMutation();

  const onCreatePost = async (post: CreatePostInput) => {
    return createPost({
      variables: {
        postData: {
          calloutID: calloutId,
          post: {
            profileData: {
              displayName: post.profileData.displayName,
              description: post.profileData.description,
            },
            tags: post.tags,
          },
        },
      },
    });
  };

  return (
    <StorageConfigContextProvider locationType="callout" calloutId={callout?.id}>
      {children({
        ref: intersectionObserverRef,
        posts,
        loading,
        creatingPost: isCreatingPost,
        canCreate: callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreatePost) ?? false,
        onCreatePost,
      })}
    </StorageConfigContextProvider>
  );
};

export default PostCalloutContainer;

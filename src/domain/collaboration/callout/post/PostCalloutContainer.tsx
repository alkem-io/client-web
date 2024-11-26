import { PostContributionProps, useCalloutPosts } from './useCalloutPosts';
import { AuthorizationPrivilege, CreatePostInput, TagsetType } from '@/core/apollo/generated/graphql-schema';
import { PostCardFragmentDoc, useCreatePostFromContributeTabMutation } from '@/core/apollo/generated/apollo-hooks';
import { useInView } from 'react-intersection-observer';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { PropsWithChildren, Ref } from 'react';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';

interface PostCalloutContainerProvided {
  ref: Ref<Element>;
  posts: PostContributionProps[];
  loading: boolean;
  onCreatePost: (post: CreatePostInput) => Promise<{ nameID: string } | undefined>;
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

const PostCalloutContainer = ({ callout, children }: PropsWithChildren<PostCalloutContainerProps>) => {
  const calloutId = callout.id;
  const { ref: intersectionObserverRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { subscriptionEnabled, posts, loading } = useCalloutPosts({
    calloutId,
    skip: !inView,
  });

  const [createPost, { loading: isCreatingPost }] = useCreatePostFromContributeTabMutation({
    update: (cache, { data }) => {
      if (subscriptionEnabled || !data) {
        return;
      }

      const { createContributionOnCallout } = data;

      const calloutRefId = cache.identify({
        __typename: 'Callout',
        id: calloutId,
      });

      if (!calloutRefId) {
        return;
      }

      cache.modify({
        id: calloutRefId,
        fields: {
          posts(existingPosts = []) {
            const newPostRef = cache.writeFragment({
              data: createContributionOnCallout.post,
              fragment: PostCardFragmentDoc,
              fragmentName: 'PostCard',
            });
            return [...existingPosts, newPostRef];
          },
        },
      });
    },
  });

  const onCreatePost = async (post: CreatePostInput) => {
    const { data } = await createPost({
      variables: {
        postData: {
          calloutID: calloutId,
          post: {
            profileData: {
              displayName: post.profileData.displayName,
              description: post.profileData.description,
            },
            tags: post.tags,
            visualUri: post.visualUri,
          },
        },
      },
      optimisticResponse: {
        createContributionOnCallout: {
          __typename: 'CalloutContribution',
          post: {
            id: '',
            nameID: '',
            profile: {
              id: '',
              url: '',
              displayName: post.profileData.displayName,
              description: post.profileData?.description,
              visual: {
                id: '-1',
                name: '',
                uri: post.visualUri ?? '',
              },
              tagset: {
                id: '-1',
                name: DEFAULT_TAGSET,
                tags: [],
                allowedValues: [],
                type: TagsetType.Freeform,
              },
            },
          },
        },
      },
    });

    const nameID = data?.createContributionOnCallout.post?.nameID;

    return nameID ? { nameID } : undefined;
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

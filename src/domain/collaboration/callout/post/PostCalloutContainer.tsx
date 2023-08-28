import { useCalloutPosts } from './useCalloutPosts';
import { ContributeTabPostFragment, TagsetType } from '../../../../core/apollo/generated/graphql-schema';
import {
  PostCardFragmentDoc,
  useCreatePostFromContributeTabMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { OnCreateInput } from './PostCallout';
import { useInView } from 'react-intersection-observer';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import { forwardRef, Ref } from 'react';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';

interface PostCalloutContainerProvided {
  posts: ContributeTabPostFragment[] | undefined;
  ref: Ref<Element>;
  loading: boolean;
  creatingPost: boolean;
  onCreatePost: (post: OnCreateInput) => Promise<{ nameID: string } | undefined>;
}

interface PostCalloutContainerProps extends SimpleContainerProps<PostCalloutContainerProvided> {
  calloutId: string;
}

const PostCalloutContainer = forwardRef<Element, PostCalloutContainerProps>(({ calloutId, children }, ref) => {
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

      const { createPostOnCallout } = data;

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
              data: createPostOnCallout,
              fragment: PostCardFragmentDoc,
              fragmentName: 'PostCard',
            });
            return [...existingPosts, newPostRef];
          },
        },
      });
    },
  });

  const onCreatePost = async (post: OnCreateInput) => {
    const { data } = await createPost({
      variables: {
        postData: {
          calloutID: calloutId,
          profileData: {
            displayName: post.profileData.displayName,
            description: post.profileData.description,
          },
          tags: post.tags,
          type: post.type,
          visualUri: post.visualUri,
        },
      },
      optimisticResponse: {
        createPostOnCallout: {
          __typename: 'Post',
          id: '',
          nameID: '',
          profile: {
            id: '',
            displayName: post.profileData.displayName,
            description: post.profileData?.description,
            visual: {
              id: '-1',
              name: '',
              uri: post.visualUri ?? '',
            },
            tagset: {
              id: '-1',
              name: 'default',
              tags: [],
              allowedValues: [],
              type: TagsetType.Freeform,
            },
          },
          type: post.type,
        },
      },
    });

    const nameID = data?.createPostOnCallout.nameID;

    return nameID ? { nameID } : undefined;
  };

  const combinedRef = useCombinedRefs(null, ref, intersectionObserverRef);

  return (
    <>
      {children({
        ref: combinedRef,
        posts,
        loading,
        creatingPost: isCreatingPost,
        onCreatePost,
      })}
    </>
  );
});

export default PostCalloutContainer;

import React, { forwardRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import PostCreationDialog from '../../post/PostCreationDialog/PostCreationDialog';
import {
  PostCardFragmentDoc,
  useCreatePostFromContributeTabMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { usePostCreatedOnCalloutSubscription } from '../usePostCreatedOnCalloutSubscription';
import { CalloutState, CreatePostOnCalloutInput } from '../../../../core/apollo/generated/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { buildPostUrl } from '../../../../common/utils/urlBuilders';
import PostCard, { PostCardPost } from './PostCard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';

export type OnCreateInput = Omit<CreatePostOnCalloutInput, 'calloutID'>;

interface PostCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const PostCallout = forwardRef<HTMLDivElement, PostCalloutProps>(
  (
    {
      callout,
      canCreate = false,
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      contributionsCount,
      blockProps,
      ...calloutLayoutProps
    },
    ref
  ) => {
    // Dialog handling
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const openCreateDialog = () => setPostDialogOpen(true);
    const closeCreateDialog = () => setPostDialogOpen(false);
    const navigate = useNavigate();

    const { ref: intersectionObserverRef, inView } = useInView({
      delay: 500,
      trackVisibility: true,
      triggerOnce: true,
    });

    const { subscriptionEnabled, posts, loading } = usePostCreatedOnCalloutSubscription({
      spaceNameId,
      calloutId: callout.id,
      challengeNameId,
      opportunityNameId,
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
          id: callout.id,
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

    const onCreate = async (post: OnCreateInput) => {
      const { data } = await createPost({
        variables: {
          postData: {
            calloutID: callout.id,
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
              },
            },
            type: post.type,
          },
        },
      });

      const nameID = data?.createPostOnCallout.nameID;

      return nameID ? { nameID } : undefined;
    };

    const postNames = useMemo(() => posts?.map(x => x.profile.displayName) ?? [], [posts]);

    const createButton = canCreate && callout.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

    const navigateToPost = (post: PostCardPost) => {
      navigate(
        buildPostUrl(callout.nameID, post.nameID, {
          spaceNameId: spaceNameId!,
          challengeNameId,
          opportunityNameId,
        })
      );
    };

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    const containerRef = useCombinedRefs(null, ref, intersectionObserverRef);

    return (
      <>
        <PageContentBlock ref={containerRef} disablePadding disableGap {...blockProps}>
          <CalloutLayout callout={callout} contributionsCount={contributionsCount} {...calloutLayoutProps}>
            <ScrollableCardsLayout
              items={loading || !inView ? [undefined, undefined] : posts ?? []}
              deps={[spaceNameId, challengeNameId, opportunityNameId]}
              createButton={!isMobile && createButton}
              maxHeight={gutters(22)}
            >
              {post => <PostCard post={post} onClick={navigateToPost} />}
            </ScrollableCardsLayout>
            {isMobile && canCreate && callout.state !== CalloutState.Closed && (
              <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />
            )}
          </CalloutLayout>
        </PageContentBlock>
        <PostCreationDialog
          open={postDialogOpen}
          onClose={closeCreateDialog}
          onCreate={onCreate}
          postNames={postNames}
          calloutDisplayName={callout.profile.displayName}
          spaceNameId={spaceNameId!}
          challengeNameId={challengeNameId}
          opportunityNameId={opportunityNameId}
          calloutId={callout.id}
          postTemplate={callout.postTemplate}
          isCreating={isCreatingPost}
        />
      </>
    );
  }
);

export default PostCallout;

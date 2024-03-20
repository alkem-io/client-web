import React, { forwardRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayout';
import PostCreationDialog from '../../post/PostCreationDialog/PostCreationDialog';
import { CalloutState, CreatePostInput } from '../../../../core/apollo/generated/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import PostCard, { PostCardPost } from './PostCard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';

interface PostCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  posts: PostCardPost[] | undefined;
  loading: boolean;
  creatingPost: boolean;
  onCreatePost: (post: CreatePostInput) => Promise<{ nameID: string } | undefined>;
}

const PostCallout = forwardRef<Element, PostCalloutProps>(
  (
    {
      callout,
      posts,
      loading,
      creatingPost,
      onCreatePost,
      canCreate = false,
      contributionsCount,
      ...calloutLayoutProps
    },
    ref
  ) => {
    // Dialog handling
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const openCreateDialog = () => setPostDialogOpen(true);
    const closeCreateDialog = () => setPostDialogOpen(false);
    const navigate = useNavigate();

    const postNames = useMemo(() => posts?.map(x => x.profile.displayName) ?? [], [posts]);

    const createButton = canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

    const navigateToPost = (post: PostCardPost) => {
      navigate(post.profile.url);
    };

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    return (
      <>
        <CalloutLayout
          contentRef={ref}
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutLayoutProps}
        >
          <ScrollableCardsLayout
            items={loading ? [undefined, undefined] : posts ?? []}
            createButton={!isMobile && createButton}
            maxHeight={gutters(22)}
          >
            {post => <PostCard post={post} onClick={navigateToPost} />}
          </ScrollableCardsLayout>
          {isMobile && canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
            <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />
          )}
        </CalloutLayout>
        <PostCreationDialog
          open={postDialogOpen}
          onClose={closeCreateDialog}
          onCreate={onCreatePost}
          postNames={postNames}
          calloutDisplayName={callout.framing.profile.displayName}
          calloutId={callout.id}
          defaultDescription={callout.contributionDefaults.postDescription}
          creating={creatingPost}
        />
      </>
    );
  }
);

export default PostCallout;

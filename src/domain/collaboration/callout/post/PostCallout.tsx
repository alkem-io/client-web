import { forwardRef, useMemo, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import CalloutLayout from '../calloutBlock/CalloutLayout';
import ScrollableCardsLayout from '@/core/ui/card/cardsLayout/ScrollableCardsLayout';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { CalloutState, CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import PostCard, { PostCardPost } from './PostCard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '@/core/ui/grid/utils';
import CalloutBlockFooter from '../calloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '@/core/ui/utils/useCurrentBreakpoint';
import {
  LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import { TypedCalloutDetails } from '../../calloutsSet/useCalloutsSet/useCalloutsSet';
import { buildPostDashboardUrl } from '@/main/routing/urlBuilders';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';
import { sortBy } from 'lodash';

interface PostCalloutProps extends BaseCalloutViewProps {
  callout: TypedCalloutDetails;
  posts: PostCardPost[] | undefined;
  loading: boolean;
  creatingPost: boolean;
  onCreatePost: (post: CreatePostInput) => Promise<unknown>;
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
      expanded,
      onExpand,
      onCollapse,
      disableRichMedia,
      ...calloutSettingsProps
    },
    ref
  ) => {
    // Dialog handling
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const openCreateDialog = () => setPostDialogOpen(true);
    const closeCreateDialog = () => setPostDialogOpen(false);
    const navigate = useNavigate();

    const postNames = useMemo(() => posts?.map(x => x.profile.displayName) ?? [], [posts]);
    const sortedPosts = useMemo(() => sortBy(posts, 'sortOrder'), [posts]);

    const createButton = canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

    const navigateToPost = (post: PostCardPost) => {
      const state: LocationStateCachedCallout = {
        [LocationStateKeyCachedCallout]: callout,
        keepScroll: true,
      };
      navigate(buildPostDashboardUrl(post.profile.url), { state });
    };

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    return (
      <CalloutSettingsContainer
        callout={callout}
        items={{ posts: sortedPosts }}
        expanded={expanded}
        onExpand={onExpand}
        disableRichMedia={disableRichMedia}
        {...calloutSettingsProps}
      >
        {calloutSettingsProvided => (
          <>
            <CalloutLayout
              contentRef={ref}
              callout={callout}
              contributionsCount={contributionsCount}
              expanded={expanded}
              onExpand={onExpand}
              onCollapse={onCollapse}
              {...calloutSettingsProvided}
            >
              <ScrollableCardsLayout
                items={loading ? [undefined, undefined] : sortedPosts ?? []}
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
              disableRichMedia={disableRichMedia}
            />
          </>
        )}
      </CalloutSettingsContainer>
    );
  }
);

export default PostCallout;

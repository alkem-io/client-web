import { useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import CreateContributionButton from '../CreateContributionButton';
import PostCard, { PostContribution } from './PostCard';
import { BaseCalloutViewProps } from '../../callout/CalloutViewTypes';
import CalloutBlockFooter from '../../callout/calloutBlock/CalloutBlockFooter';
import { useScreenSize } from '@/core/ui/grid/constants';
import {
  LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import { useCreatePostOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';
import CardsExpandableContainer from '../../callout/components/CardsExpandableContainer';

interface CalloutContributionsPostProps extends BaseCalloutViewProps {
  callout: CalloutDetailsModelExtended;
  contributions: {
    items: PostContribution[] | undefined;
    total: number;
    fetchAll?: () => Promise<unknown>
  };
  loading?: boolean;
}

const CalloutContributionsPost = ({
  ref,
  callout,
  contributions,
  loading,
  canCreateContribution,
  calloutRestrictions,
}: CalloutContributionsPostProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  // Dialog handling
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const openCreateDialog = () => setPostDialogOpen(true);
  const closeCreateDialog = () => setPostDialogOpen(false);
  const navigate = useNavigate();
  const { isSmallScreen } = useScreenSize();

  const [createPost, { loading: creatingPost }] = useCreatePostOnCalloutMutation();

  const onCreatePost = async (post: CreatePostInput) => {
    return createPost({
      variables: {
        calloutId: callout.id,
        post: {
          profileData: {
            displayName: post.profileData.displayName,
            description: post.profileData.description,
          },
          tags: post.tags,
        },
      },
    });
  };
  const createButton = canCreateContribution ? <CreateContributionButton onClick={openCreateDialog} /> : undefined;

  const navigateToPost = (postContribution: PostContribution) => {
    const state: LocationStateCachedCallout = {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
    if (postContribution.post) {
      navigate(postContribution.post?.profile.url, { state });
    }
  };

  return (
    <Gutters ref={ref}>
      <CardsExpandableContainer
        items={contributions.items}
        pagination={{ total: contributions.total, fetchAll: async () => await contributions.fetchAll?.() }}
        loading={loading}
        createButton={createButton}
      >
        {item => <PostCard contribution={item} columns={2} onClick={navigateToPost} />}
      </CardsExpandableContainer>
      {isSmallScreen && canCreateContribution && callout.settings.contribution.enabled && (
        <CalloutBlockFooter contributionsCount={contributions.total} onCreate={openCreateDialog} />
      )}
      <PostCreationDialog
        open={postDialogOpen}
        onClose={closeCreateDialog}
        onCreate={onCreatePost}
        calloutDisplayName={callout.framing.profile.displayName}
        calloutId={callout.id}
        defaultDisplayName={callout.contributionDefaults.defaultDisplayName}
        defaultDescription={callout.contributionDefaults.postDescription}
        creating={creatingPost}
        disableRichMedia={calloutRestrictions?.disableRichMedia}
      />
    </Gutters>
  );
};

CalloutContributionsPost.displayName = 'CalloutContributionsPost';
export default CalloutContributionsPost;

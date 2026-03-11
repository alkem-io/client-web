import { useState } from 'react';
import { useCreatePostOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, type CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { normalizeLink } from '@/core/utils/links';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import CreateContributionButton from '../CreateContributionButton';
import type { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';

interface CreateContributionButtonPostProps extends CalloutContributionCreateButtonProps {}

const CreateContributionButtonPost = ({
  callout,
  calloutRestrictions,
  canCreateContribution,
  onContributionCreated,
}: CreateContributionButtonPostProps) => {
  const navigate = useNavigate();
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const openCreateDialog = () => setPostDialogOpen(true);
  const closeCreateDialog = () => setPostDialogOpen(false);

  const [createPost, { loading: creatingPost }] = useCreatePostOnCalloutMutation({
    refetchQueries: ['CalloutContributions'],
    awaitRefetchQueries: true,
  });

  const onCreatePost = async (post: CreatePostInput) => {
    const result = await createPost({
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

    await onContributionCreated?.();

    if (result.data?.createContributionOnCallout.post?.profile.url) {
      navigate(normalizeLink(result.data.createContributionOnCallout.post.profile.url), {
        state: {
          [LocationStateKeyCachedCallout]: callout,
          keepScroll: true,
        },
      });
    }
  };

  return (
    <>
      {canCreateContribution ? (
        <CreateContributionButton onClick={openCreateDialog} contributionType={CalloutContributionType.Post} />
      ) : undefined}
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
    </>
  );
};

CreateContributionButtonPost.displayName = 'CreateContributionButtonPost';
export default CreateContributionButtonPost;

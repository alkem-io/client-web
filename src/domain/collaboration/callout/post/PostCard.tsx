import React, { useCallback } from 'react';
import { Skeleton } from '@mui/material';
import { PostIcon } from '../../post/icon/PostIcon';
import ContributeCard from '@core/ui/card/ContributeCard';
import CardHeader from '@core/ui/card/CardHeader';
import CardDetails from '@core/ui/card/CardDetails';
import CardDescriptionWithTags from '@core/ui/card/CardDescriptionWithTags';
import CardFooter from '@core/ui/card/CardFooter';
import CardFooterDate from '@core/ui/card/CardFooterDate';
import MessageCounter from '@core/ui/card/MessageCounter';
import { Room, VisualUriFragment } from '@core/apollo/generated/graphql-schema';
import CardHeaderCaption from '@core/ui/card/CardHeaderCaption';
import { gutters } from '@core/ui/grid/utils';
import { Identifiable } from '@core/utils/Identifiable';

export interface PostCardPost extends Identifiable {
  profile: {
    url: string;
    displayName: string;
    description?: string;
    tagset?: { tags: string[] };
  };
  bannerNarrow?: VisualUriFragment;
  createdBy?: { profile: { displayName: string } };
  comments?: Pick<Room, 'messagesCount'>;
  createdDate: string | Date; // Apollo says Date while actually it's a string
  contributionId: string;
}

interface PostCardProps {
  post: PostCardPost | undefined;
  onClick: (post: PostCardPost) => void;
}

const PostCard = ({ post, onClick }: PostCardProps) => {
  const handleClick = useCallback(() => post && onClick(post), [onClick, post]);

  if (!post) {
    return (
      <ContributeCard>
        <CardHeader title={<Skeleton />} iconComponent={PostIcon}>
          <Skeleton />
        </CardHeader>
        <Skeleton sx={{ height: gutters(8), marginX: gutters() }} />
        <CardFooter>
          <Skeleton width="100%" />
        </CardFooter>
      </ContributeCard>
    );
  }
  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={post.profile?.displayName} iconComponent={PostIcon}>
        <CardHeaderCaption>{post.createdBy?.profile.displayName}</CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={post.profile?.tagset?.tags}>{post.profile?.description}</CardDescriptionWithTags>
      </CardDetails>
      <CardFooter>
        {post.createdDate && <CardFooterDate date={post.createdDate} />}
        <MessageCounter commentsCount={post.comments?.messagesCount} />
      </CardFooter>
    </ContributeCard>
  );
};

export default PostCard;

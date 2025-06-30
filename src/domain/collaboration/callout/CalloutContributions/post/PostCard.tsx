import { useCallback } from 'react';
import { Skeleton } from '@mui/material';
import { PostIcon } from '@/domain/collaboration/post/icon/PostIcon';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardDetails from '@/core/ui/card/CardDetails';
import CardDescriptionWithTags from '@/core/ui/card/CardDescriptionWithTags';
import CardFooter from '@/core/ui/card/CardFooter';
import CardFooterDate from '@/core/ui/card/CardFooterDate';
import MessageCounter from '@/core/ui/card/MessageCounter';
import CardHeaderCaption from '@/core/ui/card/CardHeaderCaption';
import { gutters } from '@/core/ui/grid/utils';
import { Identifiable } from '@/core/utils/Identifiable';
import { isNumber } from 'lodash';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';

export interface PostCardPost extends Identifiable {
  profile: {
    url: string;
    displayName: string;
    description?: string;
    tagset?: { tags: string[] };
  };
  bannerNarrow?: VisualModel;
  createdBy?: { profile: { displayName: string } };
  comments?: { messagesCount: number };
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
        {isNumber(post.comments?.messagesCount) && post.comments?.messagesCount > 0 && (
          <MessageCounter commentsCount={post.comments?.messagesCount} />
        )}
      </CardFooter>
    </ContributeCard>
  );
};

export default PostCard;

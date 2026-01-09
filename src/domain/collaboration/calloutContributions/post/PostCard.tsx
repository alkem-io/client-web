import { useCallback } from 'react';
import { Skeleton } from '@mui/material';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardHeader from '@/core/ui/card/CardHeader';
import CardDetails from '@/core/ui/card/CardDetails';
import CardDescriptionWithTags from '@/core/ui/card/CardDescriptionWithTags';
import CardFooter from '@/core/ui/card/CardFooter';
import MessageCounter from '@/core/ui/card/MessageCounter';
import { gutters } from '@/core/ui/grid/utils';
import { Identifiable } from '@/core/utils/Identifiable';
import { isNumber } from 'lodash';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import { CalloutContributionCardComponentProps } from '../interfaces/CalloutContributionCardComponentProps';
import { formatDate } from '@/core/utils/time/utils';
import { Caption } from '@/core/ui/typography';

export interface PostContribution extends Identifiable {
  post?: {
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
  };
}

interface PostCardProps extends CalloutContributionCardComponentProps {}

const PostCard = ({ contribution, columns, selected, onClick }: PostCardProps) => {
  const handleClick = useCallback(() => contribution && onClick?.(), [onClick, contribution]);

  if (!contribution || !contribution.post) {
    return (
      <ContributeCard columns={columns}>
        <CardHeader title={<Skeleton />}>
          <Skeleton />
        </CardHeader>
        <Skeleton sx={{ height: gutters(8), marginX: gutters() }} />
        <CardFooter>
          <Skeleton width="100%" />
        </CardFooter>
      </ContributeCard>
    );
  }
  const post = contribution.post;
  return (
    <ContributeCard onClick={handleClick} columns={columns}>
      <CardHeader title={post.profile.displayName} contrast={selected} author={post.createdBy}>
        {post?.createdDate && (
          <Caption color={selected ? 'white' : 'textPrimary'}>{formatDate(post?.createdDate)}</Caption>
        )}
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={post.profile?.tagset?.tags}>{post.profile?.description}</CardDescriptionWithTags>
      </CardDetails>
      <CardFooter>
        {isNumber(post.comments?.messagesCount) && post.comments?.messagesCount > 0 && (
          <MessageCounter commentsCount={post.comments?.messagesCount} />
        )}
      </CardFooter>
    </ContributeCard>
  );
};

export default PostCard;

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

const PostCard = ({ contribution, columns, onClick, selected }: PostCardProps) => {
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
    <ContributeCard to={post?.profile.url} onClick={onClick} columns={columns}>
      <CardHeader title={post.profile.displayName} contrast={selected} author={post.createdBy}>
        {post?.createdDate && <Caption color="textPrimary">{formatDate(post?.createdDate)}</Caption>}
        {isNumber(post.comments?.messagesCount) && post.comments?.messagesCount > 0 && (
          <MessageCounter commentsCount={post.comments?.messagesCount} size="xs" />
        )}
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={post.profile?.tagset?.tags}>{post.profile?.description}</CardDescriptionWithTags>
      </CardDetails>
    </ContributeCard>
  );
};

export default PostCard;

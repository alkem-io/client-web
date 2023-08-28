import React, { useCallback } from 'react';
import { Skeleton } from '@mui/material';
import { PostIcon } from '../../post/icon/PostIcon';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../../../../core/ui/card/CardDescription';
import CardTags from '../../../../core/ui/card/CardTags';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import MessageCounter from '../../../../core/ui/card/MessageCounter';
import { ContributeTabPostFragment, Room, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import { gutters } from '../../../../core/ui/grid/utils';

type NeededFields = 'id' | 'nameID' | 'profile' | 'type';

export type PostCardPost = Pick<ContributeTabPostFragment, NeededFields> & {
  bannerNarrow?: VisualUriFragment;
  createdBy?: { profile: { displayName: string } };
  comments?: Pick<Room, 'messagesCount'>;
  createdDate: string | Date; // Apollo says Date while actually it's a string
};

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
  const tags = post.profile.tagset?.tags ?? [];
  const descriptionHeight = tags.length
    ? DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS
    : DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS + 2; // CardTags's height is gutters(2)

  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={post.profile.displayName} iconComponent={PostIcon}>
        <CardHeaderCaption noWrap>{post.createdBy?.profile.displayName}</CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={descriptionHeight}>{post.profile.description!}</CardDescription>
        <CardTags tags={tags} marginY={1} hideIfEmpty />
      </CardDetails>
      <CardFooter>
        {post.createdDate && <CardFooterDate date={post.createdDate} />}
        <MessageCounter commentsCount={post.comments?.messagesCount} />
      </CardFooter>
    </ContributeCard>
  );
};

export default PostCard;

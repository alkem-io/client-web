import React, { FC, ReactNode } from 'react';
import SearchBaseContributionCard, { SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';
import { PostIcon } from '../../../collaboration/post/icon/PostIcon';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import MessageCounter from '../../../../core/ui/card/MessageCounter';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../../../../core/ui/card/CardDescription';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardTags from '../../../../core/ui/card/CardTags';

export type SearchContributionCardCardProps = Omit<SearchBaseContributionCardProps, 'icon'> & {
  createdDate?: Date;
  commentsCount?: number;
  description?: string;
  parentSegment: ReactNode;
};

export const SearchContributionCardCard: FC<SearchContributionCardCardProps> = ({
  createdDate,
  commentsCount,
  description = '',
  tags = [],
  parentSegment,
  ...props
}) => {
  const descriptionHeight = tags.length
    ? DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS
    : DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS + 2;
  return (
    <SearchBaseContributionCard icon={PostIcon} {...props}>
      <CardDetails paddingBottom={1}>
        <CardDescription heightGutters={descriptionHeight}>{description}</CardDescription>
        <CardTags tags={tags} marginY={1} hideIfEmpty />
      </CardDetails>
      {parentSegment}
      <CardFooter>
        {createdDate && <CardFooterDate date={createdDate} />}
        <MessageCounter commentsCount={commentsCount} />
      </CardFooter>
    </SearchBaseContributionCard>
  );
};

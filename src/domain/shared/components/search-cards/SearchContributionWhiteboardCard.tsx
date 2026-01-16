import React, { FC, ReactNode } from 'react';
import SearchBaseContributionCard, { SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import CardFooterDate from '@/core/ui/card/CardFooterDate';
import CardFooter from '@/core/ui/card/CardFooter';
import CardDescriptionWithTags from '@/core/ui/card/CardDescriptionWithTags';
import CardDetails from '@/core/ui/card/CardDetails';

export type SearchContributionWhiteboardCardProps = Omit<SearchBaseContributionCardProps, 'icon'> & {
  createdDate?: Date;
  description?: string;
  parentSegment: ReactNode;
};

export const SearchContributionWhiteboardCard: FC<SearchContributionWhiteboardCardProps> = ({
  createdDate,
  description = '',
  tags = [],
  parentSegment,
  ...props
}) => {
  return (
    <SearchBaseContributionCard icon={WhiteboardIcon} {...props}>
      <CardDetails paddingBottom={1}>
        <CardDescriptionWithTags tags={tags}>{description}</CardDescriptionWithTags>
      </CardDetails>
      {parentSegment}
      <CardFooter>{createdDate && <CardFooterDate date={createdDate} />}</CardFooter>
    </SearchBaseContributionCard>
  );
};

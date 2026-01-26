import React, { FC, ReactNode } from 'react';
import SearchBaseContributionCard, { SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';
import { MemoIcon } from '@/domain/collaboration/memo/icon/MemoIcon';
import CardFooterDate from '@/core/ui/card/CardFooterDate';
import CardFooter from '@/core/ui/card/CardFooter';
import CardDescriptionWithTags from '@/core/ui/card/CardDescriptionWithTags';
import CardDetails from '@/core/ui/card/CardDetails';

export type SearchContributionMemoCardProps = Omit<SearchBaseContributionCardProps, 'icon'> & {
  createdDate?: Date;
  description?: string;
  parentSegment: ReactNode;
};

export const SearchContributionMemoCard: FC<SearchContributionMemoCardProps> = ({
  createdDate,
  description = '',
  tags = [],
  parentSegment,
  ...props
}) => {
  return (
    <SearchBaseContributionCard icon={MemoIcon} {...props}>
      <CardDetails paddingBottom={1}>
        <CardDescriptionWithTags tags={tags}>{description}</CardDescriptionWithTags>
      </CardDetails>
      {parentSegment}
      <CardFooter>{createdDate && <CardFooterDate date={createdDate} />}</CardFooter>
    </SearchBaseContributionCard>
  );
};

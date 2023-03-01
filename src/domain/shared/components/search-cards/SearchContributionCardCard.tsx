import React, { FC } from 'react';
import SearchBaseContributionCard, { SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';
import { AspectIcon } from '../../../collaboration/aspect/icon/AspectIcon';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import MessageCounter from '../../../../core/ui/card/MessageCounter';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import CardTags from '../../../../core/ui/card/CardTags';
import { gutters } from '../../../../core/ui/grid/utils';
import { CalloutIcon } from '../../../collaboration/callout/icon/CalloutIcon';

export type SearchContributionCardCardProps = Omit<SearchBaseContributionCardProps, 'icon'> & {
  createdDate?: Date;
  commentsCount?: number;
  description?: string;
};

export const SearchContributionCardCard: FC<SearchContributionCardCardProps> = ({
  createdDate,
  commentsCount,
  description = '',
  tags = [],
  parentIcon: ParentIcon,
  parentDisplayName,
  calloutDisplayName = '',
  ...props
}) => {
  return (
    <SearchBaseContributionCard icon={AspectIcon} {...props}>
      <CardDetails paddingBottom={1}>
        <CardDescription>{description}</CardDescription>
        <CardTags tags={tags} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardSegmentCaption align="left" icon={<CalloutIcon sx={{ marginLeft: gutters(0.5) }} />} noWrap>
        {calloutDisplayName}
      </CardSegmentCaption>
      {ParentIcon && parentDisplayName && (
        <CardSegmentCaption align="left" icon={<ParentIcon sx={{ marginLeft: gutters(0.5) }} />} noWrap>
          {parentDisplayName}
        </CardSegmentCaption>
      )}
      <CardFooter>
        {createdDate && <CardFooterDate date={createdDate} />}
        <MessageCounter commentsCount={commentsCount} />
      </CardFooter>
    </SearchBaseContributionCard>
  );
};

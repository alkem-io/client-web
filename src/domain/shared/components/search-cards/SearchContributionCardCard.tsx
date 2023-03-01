import React, { ComponentType, FC } from 'react';
import SearchBaseContributionCard, { SearchBaseContributionCardProps } from './base/SearchBaseContributionCard';
import { AspectIcon } from '../../../collaboration/aspect/icon/AspectIcon';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import MessageCounter from '../../../../core/ui/card/MessageCounter';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardTags from '../../../../core/ui/card/CardTags';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import { CalloutIcon } from '../../../collaboration/callout/icon/CalloutIcon';
import { SvgIconProps } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { LockOutlined } from '@mui/icons-material';

export type SearchContributionCardCardProps = Omit<SearchBaseContributionCardProps, 'icon'> & {
  createdDate?: Date;
  commentsCount?: number;
  description?: string;
  calloutInformation?: {
    displayName: string;
    url: string;
  };
  parentInformation?: {
    displayName: string;
    iconComponent: ComponentType<SvgIconProps>;
    locked?: boolean;
    url: string;
  };
};

export const SearchContributionCardCard: FC<SearchContributionCardCardProps> = ({
  createdDate,
  commentsCount,
  description = '',
  tags = [],
  calloutInformation,
  parentInformation,
  ...props
}) => {
  const stopPropagation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation();
  const ParentIcon = parentInformation?.iconComponent;

  return (
    <SearchBaseContributionCard icon={AspectIcon} {...props}>
      <CardDetails paddingBottom={1}>
        <CardDescription>{description}</CardDescription>
        <CardTags tags={tags} paddingX={1.5} marginY={1} />
      </CardDetails>
      {calloutInformation && (
        <CardSegmentCaption
          component={RouterLink}
          to={calloutInformation.url}
          icon={<CalloutIcon />}
          onClick={stopPropagation}
          noWrap
        >
          {calloutInformation.displayName}
        </CardSegmentCaption>
      )}

      {parentInformation && (
        <CardSegmentCaption
          component={RouterLink}
          to={parentInformation.url}
          icon={ParentIcon ? <ParentIcon /> : undefined}
          secondaryIcon={parentInformation.locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
          onClick={stopPropagation}
          noWrap
        >
          {parentInformation.displayName}
        </CardSegmentCaption>
      )}

      <CardFooter>
        {createdDate && <CardFooterDate date={createdDate} />}
        <MessageCounter commentsCount={commentsCount} />
      </CardFooter>
    </SearchBaseContributionCard>
  );
};

import { Skeleton } from '@mui/material';
import React, { ReactNode } from 'react';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import ContributeCard, { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import { CalloutContributionType, CalloutState, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { DesignServicesOutlined } from '@mui/icons-material';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';
import { Visual } from '../../../common/visual/Visual';
import { getCalloutTypeIcon } from './calloutIcons';

interface ContributionPolicy {
  allowedContributionTypes: CalloutContributionType[];
  state: CalloutState;
}

export interface CalloutCardCallout {
  profile: {
    displayName: string;
    description?: string;
    tagset?: {
      tags: string[];
    };
  };
  type: CalloutType;
  contributionPolicy: ContributionPolicy;
}

interface Author {
  profile: {
    displayName: string;
    avatar?: Visual;
  };
}

interface CalloutCardProps extends ContributeCardProps {
  callout: CalloutCardCallout | undefined;
  author?: Author;
  loading?: boolean;
  footer?: ReactNode;
  template?: boolean;
}

const CalloutCard = ({
  callout,
  author,
  loading = false,
  template = false,
  footer,
  ...cardProps
}: CalloutCardProps) => {
  const CalloutIcon = !template && callout ? getCalloutTypeIcon(callout) : DesignServicesOutlined;

  return (
    <ContributeCard {...cardProps}>
      <CardHeader title={callout?.profile.displayName} iconComponent={CalloutIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={author?.profile.avatar?.uri}>
          {author?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={callout?.profile.tagset?.tags}>
          {callout?.profile.description}
        </CardDescriptionWithTags>
      </CardDetails>
      {footer}
    </ContributeCard>
  );
};

export default CalloutCard;

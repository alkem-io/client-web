import CardSegmentCaption from '../../../core/ui/card/CardSegmentCaption';
import InnovationPackIcon from '../../collaboration/InnovationPack/InnovationPackIcon';
import { Caption } from '../../../core/ui/typography';
import { Paper, Skeleton } from '@mui/material';
import React from 'react';
import SwapColors from '../../../core/ui/palette/SwapColors';
import Gutters from '../../../core/ui/grid/Gutters';
import { gutters } from '../../../core/ui/grid/utils';
import {
  CONTRIBUTION_ICON,
  ContributionPolicy,
  getCalloutTypeIcon,
} from '../../collaboration/callout/calloutCard/calloutIcons';
import { CalloutType } from '../../../core/apollo/generated/graphql-schema';

interface CalloutTemplateCardFooterProps {
  callout?: {
    type: CalloutType;
    contributionPolicy: ContributionPolicy;
  };
  innovationPack?: {
    profile: {
      displayName: string;
    };
  };
  loading?: boolean;
}

const CalloutTemplateCardFooter = ({ callout, innovationPack, loading }: CalloutTemplateCardFooterProps) => {
  const CalloutTypeIcon = callout && getCalloutTypeIcon(callout);

  return (
    <>
      <SwapColors>
        <Gutters row component={Paper} height={gutters(2)} alignItems="center" justifyContent="space-evenly" square>
          {CalloutTypeIcon && <CalloutTypeIcon />}
          {callout?.contributionPolicy.allowedContributionTypes.map(type => {
            const Icon = CONTRIBUTION_ICON[type];
            return <Icon key={type} />;
          })}
        </Gutters>
      </SwapColors>
      {innovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </>
  );
};

export default CalloutTemplateCardFooter;

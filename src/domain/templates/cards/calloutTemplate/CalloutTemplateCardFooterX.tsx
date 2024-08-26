import { Paper, Skeleton } from '@mui/material';
import React from 'react';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import {
  CONTRIBUTION_ICON,
  ContributionPolicy,
  getCalloutTypeIcon,
} from '../../../collaboration/callout/calloutCard/calloutIcons';
import SwapColors from '../../../../core/ui/palette/SwapColors';
import { gutters } from '../../../../core/ui/grid/utils';
import Gutters from '../../../../core/ui/grid/Gutters';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../core/ui/typography';
import InnovationPackIcon from '../../../InnovationPack/InnovationPackIcon';

interface CalloutTemplateCardFooterPropsX {
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

const CalloutTemplateCardFooterX = ({ callout, innovationPack, loading }: CalloutTemplateCardFooterPropsX) => {
  const CalloutTypeIcon = callout && getCalloutTypeIcon(callout);

  return (
    <>
      <SwapColors>
        <Gutters row component={Paper} height={gutters(2)} alignItems="center" justifyContent="space-evenly" square>
          {CalloutTypeIcon && <CalloutTypeIcon />}
          {callout?.contributionPolicy?.allowedContributionTypes.map(type => {
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

export default CalloutTemplateCardFooterX;

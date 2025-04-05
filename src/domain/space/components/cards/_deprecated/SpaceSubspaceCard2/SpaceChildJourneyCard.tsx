import React, { ReactNode } from 'react';
import { BlockTitle } from '@/core/ui/typography';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import SpaceCard2, { SpaceCard2Props } from '../../SpaceCard2';
import InnovationFlowCardSegment from '../InnovationFlowCardSegment';
import SpaceCardTagline from '../../components/SpaceCardTagline';
import SpaceCardDescription from '../../components/SpaceCardDescription';
import SpaceCardSpacing from '../../components/SpaceCardSpacing';

export interface SpaceChildJourneyCardProps extends Omit<SpaceCard2Props, 'header' | 'expansion'> {
  displayName: string;
  tagline: string;
  vision: string;
  innovationFlowState?: string;
  parentSegment?: ReactNode;
}

/**
 * @deprecated
 * This is the old ChallengeCard. We need to review the usage of those cards and maybe replace them with new ones,
 * such as SpaceSubspaceCard.
 */
const SpaceChildJourneyCard = ({
  displayName,
  tagline,
  vision,
  innovationFlowState,
  parentSegment,
  ...props
}: SpaceChildJourneyCardProps) => {
  return (
    <SpaceCard2
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      expansion={
        <>
          <SpaceCardDescription>{vision}</SpaceCardDescription>
          {parentSegment ?? <SpaceCardSpacing />}
        </>
      }
      {...props}
    >
      {innovationFlowState && <InnovationFlowCardSegment>{innovationFlowState}</InnovationFlowCardSegment>}
      <SpaceCardTagline>{tagline}</SpaceCardTagline>
    </SpaceCard2>
  );
};

export default SpaceChildJourneyCard;

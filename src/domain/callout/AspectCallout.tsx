import CalloutLayout, { CalloutLayoutProps } from './CalloutLayout';
import AspectCard, { AspectCardAspect } from '../../components/composite/common/cards/AspectCard/AspectCard';
import CardsLayout from '../shared/layout/CardsLayout/CardsLayout';
import React from 'react';
import { OptionalCoreEntityIds } from '../shared/types/CoreEntityIds';

interface AspectCalloutProps extends OptionalCoreEntityIds {
  callout: CalloutLayoutProps['callout'] & {
    aspects: AspectCardAspect[];
  };
  loading?: boolean;
}

const AspectCallout = ({ callout, loading, hubNameId, challengeNameId, opportunityNameId }: AspectCalloutProps) => {
  return (
    <CalloutLayout callout={callout} maxHeight={42.5}>
      <CardsLayout
        items={loading ? [undefined, undefined] : callout.aspects}
        deps={[hubNameId, challengeNameId, opportunityNameId]}
      >
        {aspect => (
          <AspectCard
            aspect={aspect}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunityNameId}
            loading={!aspect}
            keepScroll
          />
        )}
      </CardsLayout>
    </CalloutLayout>
  );
};

export default AspectCallout;

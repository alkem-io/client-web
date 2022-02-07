import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import React, { FC } from 'react';
import LifecycleState from '../../components/composite/entities/Lifecycle/LifecycleState';
import ContextSection from '../../components/composite/sections/ContextSection';
import { Context, ContextTabFragment, LifecycleContextTabFragment, Tagset } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { getVisualBanner } from '../../utils/visuals.utils';

export interface OpportunityContextViewEntities {
  context?: ContextTabFragment;
  opportunityDisplayName?: string;
  opportunityTagset?: Tagset;
  opportunityLifecycle?: LifecycleContextTabFragment;
}

export interface OpportunityContextViewActions {}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {
  canReadAspects: boolean;
}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ entities, options, state }) => {
  const { canReadAspects } = options;
  const { loading } = state;
  const { context, opportunityDisplayName, opportunityTagset, opportunityLifecycle } = entities;

  const {
    tagline = '',
    impact = '',
    background = '',
    vision = '',
    who = '',
    references,
    aspects = [],
    visuals = [],
  } = context || ({} as Context);
  const banner = getVisualBanner(visuals);

  return (
    <ContextSection
      primaryAction={
        <Box display="flex">
          <LifecycleState lifecycle={opportunityLifecycle} />
        </Box>
      }
      banner={banner}
      background={background}
      displayName={opportunityDisplayName}
      impact={impact}
      tagline={tagline}
      vision={vision}
      who={who}
      keywords={opportunityTagset?.tags}
      references={references}
      aspects={aspects}
      aspectsLoading={loading}
      canReadAspects={canReadAspects}
    />
  );
};
export default OpportunityContextView;

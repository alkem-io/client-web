import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import React, { FC } from 'react';
import LifecycleState from '../../components/composite/entities/Lifecycle/LifecycleState';
import ContextSection from '../../components/composite/sections/ContextSection';
import {
  AspectCardFragment,
  Context,
  ContextTabFragment,
  LifecycleContextTabFragment,
  ReferenceContextTabFragment,
  Tagset,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';

export interface OpportunityContextViewEntities {
  context?: ContextTabFragment;
  opportunityDisplayName?: string;
  opportunityTagset?: Tagset;
  opportunityLifecycle?: LifecycleContextTabFragment;
  aspects?: AspectCardFragment[];
  references?: ReferenceContextTabFragment[];
}

export interface OpportunityContextViewActions {}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ entities, state }) => {
  const { loading } = state;
  const { context, opportunityDisplayName, opportunityTagset, opportunityLifecycle } = entities;

  const {
    tagline = '',
    impact = '',
    background = '',
    location = undefined,
    vision = '',
    who = '',
    id = '',
  } = context || ({} as Context);
  const references = entities?.references;

  return (
    <ContextSection
      primaryAction={
        <Box display="flex">
          <LifecycleState lifecycle={opportunityLifecycle} />
        </Box>
      }
      background={background}
      displayName={opportunityDisplayName}
      impact={impact}
      tagline={tagline}
      location={location}
      vision={vision}
      who={who}
      contextId={id}
      keywords={opportunityTagset?.tags}
      references={references}
      loading={loading}
    />
  );
};
export default OpportunityContextView;
